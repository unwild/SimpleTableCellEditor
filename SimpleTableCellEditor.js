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

        if (typeof _tableId === 'undefined')
            _tableId = "table";

        this.tableId = _tableId; //Store the tableId (One CellEditor must be instantiated for each table)

        this.params = _instance._GetExtendedEditorParams(_params); //Load default params over given ones
        this.CellEdition = null; //CellEdition contains the current edited cell


        //Handle click outside table to end edition
        $(document).mouseup(function (e) {

            var container = $(`#${_instance.tableId}`);

            if (!container.is(e.target) && container.has(e.target).length === 0) {
                _instance._FreeCurrentCell();
            }
        });
    }


    SetEditable(elem, _cellParams) {

        var _instance = this;

        if (!_instance._isValidElem(elem))
            return;

        var cellParams = _instance._GetExtendedCellParams(_cellParams);

        //If click on td (not already in edit ones)
        $(elem).on('click', function () {

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


    _HandleKeyPressed(which, elem, cellParams) {

        if (cellParams.keys.validation.includes(which))
            this._EndEditCell(elem, cellParams);

        else if (cellParams.keys.cancellation.includes(which))
            this._CancelEditCell(elem, cellParams);

    }

    _EditCell(elem, cellParams) {

        this._FreeCurrentCell(cellParams);

        this.CellEdition = new SimpleTableCellEdition(elem, cellParams);

        //Extract old/current value from cell
        var oldVal = cellParams.internals.extractValue(elem);

        //flagging working cell
        $(elem).addClass(this.params.inEditClass);

        //Rendering 
        cellParams.internals.renderEditor(elem, oldVal);

        //Trigger custom event
        this._FireOnEditEnterEvent(elem, oldVal);

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

        //Get new val
        var newVal = cellParams.internals.extractEditorValue(elem);

        //clean cell
        $(elem).removeClass(this.params.inEditClass);
        $(elem).html('');

        //if validation method return false for new value
        if (!cellParams.validation(newVal))
            keepChanges = false;

        //format new value
        var formattedNewVal = cellParams.formatter(newVal);

        //Trigger custom event
        this._FireOnEditExitEvent(elem, this.CellEdition.oldValue, formattedNewVal, keepChanges);

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

    _FreeCurrentCell() {

        var current = this._GetCurrentEdition();

        if (current === null)
            return;

        this._EndEditCell(current.Elem, current.cellParams);
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
            internals: this._GetDefaultInternals()
        };

    }

    _GetDefaultInternals() {

        return {
            renderValue: (elem, formattedNewVal) => { $(elem).text(formattedNewVal); },
            renderEditor: (elem, oldVal) => {
                $(elem).html(`<input type='text' style="width:100%; max-width:none">`);
                var input = $(elem).find('input');
                input.focus();
                input.val(oldVal);
            },
            extractEditorValue: (elem) => { return $(elem).find('input').val(); },
            extractValue: (elem) => { return $(elem).text(); }
        };

    }

    _FireOnEditEnterEvent(elem, oldVal) {

        $(`#${this.tableId}`).trigger({
            type: "cell:onEditEnter",
            element: elem,
            oldValue: oldVal
        });
    }

    _FireOnEditExitEvent(elem, oldVal, newVal, applied) {

        $(`#${this.tableId}`).trigger({
            type: "cell:onEditExit",
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


    _isValidElem(elem) {
        return (elem !== null && typeof elem !== 'undefined' && $(elem).length > 0);
    }

}