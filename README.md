## SimpleTableCellEditor
#### Simple Jquery based table td editor
*SimpleTableCellEditor requires JQuery*

Allow table content to be edited clientside, with a click inside editable cell.
A 'cell:edited' event is triggered if the cell content has been edited.

'cell:edited' event contains :
 - evt.element (JQuery node object)
 - evt.oldValue
 - evt.newValue

## Methods
 - SimpleTableCellEditor : constructor(tableId, tableCellEditorParams)
 - SimpleTableCellEditor : SetEditable(element, cellEditorParams)
 - SimpleTableCellEditor : SetEditableClass(className, cellEditorParams)

## Parameters

* tableCellEditorParams
  * inEditClass : class used to flag td in edit mode
* cellEditorParams
  * validation : method used to validate new value
  * formatter : method to format new value
  * keys : keys handling validation and cancellation. Default value : { validation : [13], cancellation :[37] }  
## Usage exemple

    <table id="myTableId">
	    <tr>
	      <td class="editMe">Editable text</td>
	      <td>Uneditable text</td>
	      <td class="feedMeNumbers">Numbers only</td>
	    </tr>
    </table>
    
    <script>
      editor = new SimpleTableCellEditor("myTableId");
      editor.SetEditableClass("editMe");
      editor.SetEditableClass("feedMeNumbers", { validation: $.isNumeric }); //If validation return false, value is not updated
   
      $('#myTableId').on("cell:edited", function (event) {              
        console.log(`Cell edited : ${event.oldValue} => ${event.newValue}`);
      });               
    </script>
