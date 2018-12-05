
# SimpleTableCellEditor
Simple Jquery based table cell editor

Needs JQuery !

Simple Usage exemple :

    <table id="myTableId">
	    <tr>
	      <td class="editMe">Editable text</td>
	      <td>Uneditable text</td>
	    </tr>
    </table>
    
    <script>
      editor = new CellEditor("myTableId");
      editor.SetClassEditable("editMe");
   
      $('#myTableId').on("cell:edited", function (event) {              
        console.log(`Cell edited : ${event.oldValue} => ${event.newValue}`);
      });               
    </script>
