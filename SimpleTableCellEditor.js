window.onload = function () {
    if (!window.jQuery) {
        throw "jQuery is not loaded";
    }
}

class SimpleTableCellEdition {

    constructor(elem, _cellParams) {

        this.Elem = elem;
        this.oldContent = $(elem).html();
        this.oldValue = _cellParams.internals.extractValue(elem);
        this.cellParams = _cellParams;
    }

}

class SimpleTableCellEditor {


    constructor(_tableId, _params) {

        var _instance = this;

        _instance.EditionEndOrigin = {
            OutsideTable: 1,
            AnotherCell: 2
        };

        if (typeof _tableId === 'undefined')
            _tableId = "table";

        this.tableId = _tableId; //Store the tableId (One CellEditor must be instantiated for each table)

        this.params = _instance._GetExtendedEditorParams(_params); //Load default params over given ones
        this.CellEdition = null; //CellEdition contains the current edited cell

        //If DataTable : Handling DataTable reload event
        this._TryHandleDataTableReloadEvent();

        //Handle click outside table to end edition
        $(document).mouseup(function (e) {

            var container = $(`#${_instance.tableId}`);

            if (!container.is(e.target) && container.has(e.target).length === 0) {
                _instance._FreeCurrentCell(_instance.EditionEndOrigin.OutsideTable);
            }

            return;
        });
    }


    SetEditable(elem, _cellParams) {

        var _instance = this;

        if (!_instance._isValidElem(elem))
            return;

        var cellParams = _instance._GetExtendedCellParams(_cellParams);

        //If click on td (not already in edit ones)
        $(elem).on('click', function (evt) {

            if ($(this).hasClass(_instance.params.inEditClass))
                return;

            _instance._EditCell(this, cellParams);

        });


        $(elem).on('keydown', function (event) {

            if (!$(this).hasClass(_instance.params.inEditClass))
                return;


            _instance._HandleKeyPressed(event.which, this, cellParams);

        });

    }

    SetEditableClass(editableClass, _cellParams) {

        var _instance = this;

        var cellParams = _instance._GetExtendedCellParams(_cellParams);

        //If click on td (not already in edit ones)
        $(`#${this.tableId}`).on('click', `td.${editableClass}:not(.${_instance.params.inEditClass})`, function () {
            _instance._EditCell(this, cellParams);
        });


        $(`#${this.tableId}`).on('keydown', `td.${editableClass}.${_instance.params.inEditClass}`, function (event) {

            _instance._HandleKeyPressed(event.which, this, cellParams);

        });

    }


    //Private methods
    _HandleKeyPressed(which, elem, cellParams) {

        //If validation key is pressed -> end edit cell (keep changes)
        if (cellParams.keys.validation.includes(which))
            this._FreeCell(elem, cellParams, true);

        //If cancellation key is pressed -> end edit cell (do not keep changes)
        else if (cellParams.keys.cancellation.includes(which))
            this._FreeCell(elem, cellParams, false);

    }

    _EditCell(elem, cellParams) {

        //Triggering before entering edition mode event
        var onEditEnterEvent = this._FireOnEditEnterEvent(elem);

        if (onEditEnterEvent.isDefaultPrevented())
            return;

        //We free up hypothetical previous cell
        this._FreeCurrentCell(this.EditionEndOrigin.AnotherCell);

        this.CellEdition = new SimpleTableCellEdition(elem, cellParams);

        //Storing DataTable index if table is DataTable
        if (this.isDataTable) {
            this.CellEdition.cellIndex = $(`#${this.tableId}`).DataTable().cell($(elem)).index();
        }

        //Extract old/current value from cell
        var oldVal = cellParams.internals.extractValue(elem);

        //flagging working cell
        $(elem).addClass(this.params.inEditClass);

        //Rendering 
        cellParams.internals.renderEditor(elem, oldVal);

        //Triggering edition mode entered event
        this._FireOnEditEnteredEvent(elem, oldVal);

    }

    _EndEditCell(elem, cellParams) {
        this._FreeCell(elem, cellParams, true);
    }

    _CancelEditCell(elem, cellParams) {
        this._FreeCell(elem, cellParams, false);
    }

    _FreeCell(elem, cellParams, keepChanges) {

        if (!this._isValidElem(elem) || this.CellEdition === null)
            return;

        //Triggering before exit event
        var onEditExitEvent = this._FireOnEditExitEvent(elem, this.CellEdition.oldValue);
        if (onEditExitEvent.isDefaultPrevented())
            return;

        //Get new val
        var newVal = cellParams.internals.extractEditorValue(elem);

        //clean cell
        $(elem).removeClass(this.params.inEditClass);
        $(elem).html('');

        //format new value
        var formattedNewVal = cellParams.formatter(newVal);

        //if validation method return false for new value AND value changed
        if (!cellParams.validation(newVal) || this.CellEdition.oldValue === formattedNewVal)
            keepChanges = false;

        //Trigger on edit exited event
        this._FireOnEditExitedEvent(elem, this.CellEdition.oldValue, formattedNewVal, keepChanges);

        if (keepChanges) {

            //render new value in cell
            cellParams.internals.renderValue(elem, formattedNewVal);

            //Trigger custom event
            this._FireEditedEvent(elem, this.CellEdition.oldValue, formattedNewVal);

        }
        else {

            //render old value
            $(elem).html(this.CellEdition.oldContent);

        }

        this.CellEdition = null;
    }

    _FreeCurrentCell(editionEndOrigin) {

        var current = this._GetCurrentEdition();

        if (current === null)
            return;

        var keepChanges = true;

        //If cell freeing comes from outside table click and cell params cause cancellation from outside table clicks
        if (editionEndOrigin === this.EditionEndOrigin.OutsideTable && current.cellParams.behaviour.outsideTableClickCauseCancellation)
            keepChanges = false; //We do not keep changes (cancellation)

        //If cell freeing comes from another cell click and cell params cause cancellation from another cells clicks
        if (editionEndOrigin === this.EditionEndOrigin.AnotherCell && current.cellParams.behaviour.anotherCellClickCauseCancellation)
            keepChanges = false; //We do not keep changes (cancellation)

        this._FreeCell(current.Elem, current.cellParams, keepChanges);


    }

    _GetCurrentEdition() {

        return (this.CellEdition === null ? null : this.CellEdition);
    }


    _GetExtendedEditorParams(_params) {

        var _instance = this;

        return $.extend(true, {}, _instance._GetDefaultEditorParams(), _params);

    }

    _GetExtendedCellParams(_cellParams) {

        var _instance = this;

        return $.extend(true, {}, _instance._GetDefaultCellParams(), _cellParams);

    }


    //Events
    _FireOnEditEnterEvent(elem) { //Before entering edit Mode

        var evt = jQuery.Event("cell:onEditEnter", { element: elem });

        $(`#${this.tableId}`).trigger(evt);

        return evt;
    }

    _FireOnEditEnteredEvent(elem, oldVal) { //After entering edit mode

        $(`#${this.tableId}`).trigger({
            type: "cell:onEditEntered",
            element: elem,
            oldValue: oldVal
        });
    }

    _FireOnEditExitEvent(elem, oldVal) { //Before exiting edit mode

        var evt = jQuery.Event("cell:onEditExit", { element: elem, oldValue: oldVal });

        $(`#${this.tableId}`).trigger(evt);

        return evt;
    }

    _FireOnEditExitedEvent(elem, oldVal, newVal, applied) { //After exiting edit mode

        $(`#${this.tableId}`).trigger({
            type: "cell:onEditExited",
            element: elem,
            newValue: newVal,
            oldValue: oldVal,
            applied: applied
        });
    }

    _FireEditedEvent(elem, oldVal, newVal) {

        $(`#${this.tableId}`).trigger({
            type: "cell:edited",
            element: elem,
            newValue: newVal,
            oldValue: oldVal
        });
    }


    //DataTable specific methods
    _TryHandleDataTableReloadEvent() {

        var _instance = this;
        this.isDataTable = false;

        try {
            if ($.fn.DataTable.isDataTable(`#${_instance.tableId}`))
                _instance.isDataTable = true;
        } catch (e) {
            return;
        }

        if (_instance.isDataTable) {

            $(`#${_instance.tableId}`).on('draw.dt', function () {

                if (_instance.CellEdition !== null && _instance.CellEdition.Elem !== null) {

                    var node = $(`#${_instance.tableId}`).DataTable().cell(_instance.CellEdition.cellIndex).node();
                    _instance._EditCell(node, _instance.CellEdition.cellParams);

                }

            });

        }

    }



    //Defaults
    _GetDefaultEditorParams() {

        return {
            inEditClass: "inEdit" //class used to flag cell in edit mode
        };
    }

    _GetDefaultCellParams() {

        return {
            validation: (value) => { return true; }, //method used to validate new value
            formatter: (value) => { return value; }, //Method used to format new value
            keys: {
                validation: [13],
                cancellation: [27]
            },
            behaviour: {
                outsideTableClickCauseCancellation: false,
                anotherCellClickCauseCancellation: false
            },
            internals: this._GetDefaultInternals()
        };

    }

    _GetDefaultInternals() {

        return {
            renderValue: (elem, formattedNewVal) => { $(elem).text(formattedNewVal); },
            renderEditor: (elem, oldVal) => {
                $(elem).html(`<input type='text' style="width:100%; max-width:none">`);
                //Focus part
                var input = $(elem).find('input');
                input.focus();
                input.val(oldVal);
            },
            extractEditorValue: (elem) => { return $(elem).find('input').val(); },
            extractValue: (elem) => { return $(elem).text(); }
        };

    }



    //Utils
    _isValidElem(elem) {
        return (elem !== null && typeof elem !== 'undefined' && $(elem).length > 0);
    }

}