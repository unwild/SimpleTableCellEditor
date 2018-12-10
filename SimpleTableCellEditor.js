class SimpleTableCellEdition {

    constructor(elem, _cellParams) {

        this.Elem = elem;
        this.oldContent = $(elem).html();
        this.oldValue = $(elem).text();
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

        var content = $(elem).text();
        $(elem).addClass(this.params.inEditClass);
        $(elem).html(`<input type='text' style="width:100%; max-width:none">`);

        var input = $(elem).find('input');
        input.focus();
        input.val(content);
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

        var newVal = $(elem).find('input').val();

        $(elem).removeClass(this.params.inEditClass);
        $(elem).html('');

        //if validation method return false for new value
        if (!cellParams.validation(newVal))
            keepChanges = false;

        if (keepChanges) {

            var formattedNewVal = cellParams.formatter(newVal);

            $(elem).text(formattedNewVal);

            //Trigger custom event
            $(`#${this.tableId}`).trigger({
                type: "cell:edited",
                element: elem,
                newValue: formattedNewVal,
                oldValue: this.CellEdition.oldValue
            });

        }
        else {

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
            }
        };

    }


    _isValidElem(elem) {
        return (elem !== null && typeof elem !== 'undefined' && $(elem).length > 0);
    }

}