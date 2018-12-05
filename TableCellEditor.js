class CellEditorOptions {

    constructor(contentType) {

        if (typeof contentType === 'undefined')
            contentType = "text";

        this.ContentType = contentType;

    }

}

class CellEdition {

    constructor(elem) {

        this.Elem = elem;
        this.oldContent = $(elem).html();
        this.oldValue = $(elem).text();
    }

}

class CellEditor {

    constructor(_tableId, _inEditClass) {

        var _instance = this;

        if (typeof _tableId === 'undefined')
            _tableId = "table";

        if (typeof _inEditClass === 'undefined')
            _inEditClass = 'inEdit';


        this.tableId = _tableId; //Store the tableId (One CellEditor must be instantiated for each table)
        this.inEditClass = _inEditClass; //class used to flag cell in edit mode

        this.CellEdition = null; //CellEdition contains the current edited cell


        //Handle click outside table to end edition
        $(document).mouseup(function (e) {

            var container = $(`#${_instance.tableId}`);

            if (!container.is(e.target) && container.has(e.target).length === 0) {
                _instance.FreeCurrentCell();
            }
        });
    }

    SetClassEditable(editableClass, options) {

        var _instance = this;

        if (typeof options === 'undefined')
            options = new CellEditorOptions();

        //If click on td (not already in edit ones)
        $(`#${this.tableId}`).on('click', `td.${editableClass}:not(.${_instance.inEditClass})`, function () {
            _instance.EditCell(this, options);
        });


        $(`#${this.tableId}`).on('keydown', `td.${editableClass}.${this.inEditClass}`, function (event) {

            if (event.which === 13)
                _instance.EndEditCell(this);
            else if (event.which === 27)
                _instance.AbortEditCell(this);
        });

    }

    EditCell(elem, options) {

        this.FreeCurrentCell();

        this.CellEdition = new CellEdition(elem);

        var content = $(elem).text();
        $(elem).addClass(this.inEditClass);
        $(elem).html(`<input type='text' style="width:100%; max-width:none">`);

        var input = $(elem).find('input');
        input.focus();
        input.val(content);
    }

    EndEditCell(elem) {
        this.FreeCell(elem, true);
    }

    AbortEditCell(elem) {
        this.FreeCell(elem, false);
    }

    FreeCell(elem, keepChanges) {

        if (typeof $(elem).length === 'undefined' || $(elem).length === 0)
            return;

        var newVal = $(elem).find('input').val();

        $(elem).removeClass(this.inEditClass);
        $(elem).html('');

        if (keepChanges)
            $(elem).text(newVal);
        else
            $(elem).html(this.CellEdition.oldContent);


        if (keepChanges) {

            //Trigger custom event
            $(`#${this.tableId}`).trigger({
                type: "cell:edited",
                element: elem,
                newValue: newVal,
                oldValue: this.CellEdition.oldValue
            });

        }

        this.CellEdition = null;


    }

    FreeCurrentCell() {

        this.EndEditCell(this.GetCurrentCell());
    }

    GetCurrentCell() {

        // return $(`#${this.tableId}`).find(`td.${this.inEditClass}`);
        return (this.CellEdition === null ? null : this.CellEdition.Elem);
    }
}