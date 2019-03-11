

## SimpleTableCellEditor
#### Simple Jquery based table td editor
*SimpleTableCellEditor requires JQuery*

Allow table content to be edited clientside, with a click inside editable cell.  
A 'cell:edited' event is triggered if the cell content has been edited and the content changed.

Quick example : https://codepen.io/anon/pen/xmGOew

## Events
* "**cell:edited**" : Cell has been edited with new value
  * evt.element (JQuery node object)
  * evt.oldValue
  * evt.newValue
* "**cell:onEditEnter**" : Before edition mode is entered
  * evt.element (JQuery node object)
* "**cell:onEditEntered**" : After edition mode has been entered
  * evt.element (JQuery node object)
  * evt.oldValue
* "**cell:onEditExit**" : Before edition mode is exited
  * evt.element (JQuery node object)
  * evt.oldValue
* "**cell:onEditExited**" : After edition mode has been exited
  * evt.element (JQuery node object)
  * evt.oldValue
  * evt.newValue
  * evt.applied (boolean, will the edition be applied)

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
  * keys : keys handling validation and cancellation. Default value : { validation : [13], cancellation : [37] }  
  
## Usage example
```html
    <table id="myTableId">
	    <tr>
	      <td class="editMe">Editable text</td>
	      <td>Uneditable text</td>
	      <td class="feedMeNumbers">Numbers only</td>
	    </tr>
    </table>
```
```javascript
    <script>
      editor = new SimpleTableCellEditor("myTableId");
      editor.SetEditableClass("editMe");
      editor.SetEditableClass("feedMeNumbers", { validation: $.isNumeric }); //If validation return false, value is not updated
   
      $('#myTableId').on("cell:edited", function (event) {              
        console.log(`Cell edited : ${event.oldValue} => ${event.newValue}`);
      });               
    </script>
```
Full parameters exemple :
```html
    <table id="myTableId">
	    <tr>
	      <td class="editMe">editable numbers</td>
	    </tr>
    </table> 
```
```javascript
    <script>
    
      editor = new SimpleTableCellEditor("myTableId", { inEditClass: "busy" } );
      
      editor.SetEditableClass("editMe", {  //tds with .editMe class will be editable
            validation: $.isNumeric,  //value entered must be numeric
            formatter: (val) => { return val * 10; },  //value entered will be multiplied by 10
            keys: {
                validation: [13, 107, 35], //these keys will trigger validation (evt.which)
                cancellation: [27, 109] //these keys will trigger cancellation (evt.which)
            }
	    
        });            
    </script>
```
## DataTable Support
* DataTable table redrawn is supported, active cell editor will reappear after a table reload


## Advanced options

### cellParams.behaviour

Default value for cellParams.behaviour :  
```javascript

    behaviour: {
                outsideTableClickCauseCancellation: false, //if user end edition by clicking outside the table, cancel edition or save the value ?
                anotherCellClickCauseCancellation: false //if user end edition by clicking another cell, cancel edition or save the value ?
            }
    
```

By default, outsideTableClick and anotherCellClick are set to "**false**", the values are saved

### cellParams.internals
cellParams.internals can be overridden.  
Default value for cellParams.internals :  
```javascript

      {
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
```
