

# SimpleTableCellEditor
Simple Jquery based table cell editor

Needs JQuery !

Simple Usage exemple :

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


"cell:edited" event contains :
 - evt.element -> Modified TD Jquery DOM object
 - evt.oldValue
 - evt.newValue
