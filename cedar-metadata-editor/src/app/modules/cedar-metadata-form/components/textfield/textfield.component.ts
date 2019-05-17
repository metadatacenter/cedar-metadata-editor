import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

import {FileNode} from "../../models/file-node";
import {ValidationService} from "../../services/validation.service";

@Component({
  selector: 'cedar-textfield',
  templateUrl: './textfield.component.html',
  styleUrls: ['./textfield.component.less']
})
export class TextfieldComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() control: FormControl;
  @Input() node: FileNode;
  @Input() index: number;
  @Input() disabled: boolean;
  @Output() changed = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
      // initialize the value
      this.formGroup.get('values').setValue(this.getValue(this.node.model[this.node.key], this.node.valueLocation));
      this.setValidators(this.formGroup);

      // watch for changes
      this.formGroup.get( 'values').valueChanges.subscribe(value => {

        // update our metadata model
        this.node.model[this.node.key] = this.setValue(value, this.node.model[this.node.key], this.node.valueLocation);

        // fire off change message to parent
        this.changed.emit({
          'type': this.node.type,
          'subtype': this.node.subtype,
          'model': this.node.model,
          'key': this.node.key,
          'index': 0,
          'location': this.node.valueLocation,
          'value': value
        });
      })
  }

  setValidators(formGroup:FormGroup) {
    const validators = ValidationService.getValidators(this.node);
    this.formGroup.get('values')['controls'].forEach(function(control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    })
  }


  // get the value out of the model and into something the form can edit
  getValue(model, valueLocation) {
    let result = [];
    if (model) {
      if (Array.isArray(model)) {
        for (let i = 0; i < model.length; i++) {
          result.push(model[i][valueLocation] || null);
        }
      } else {
        result.push(model[valueLocation] || null);
      }
    } else {
      result.push(null);
    }
    return result;

  }


  // create the metadata model date object
  setVal(value, valueLocation) {
    let obj = {};
    obj[valueLocation] = value ? value : null;
    return obj;
  }

  // get the form value into the model
  setValue(value, model, valueLocation) {
    let result = [];
    if (value.length > 1) {
      value.forEach((val) => {
        result.push(this.setVal(val,valueLocation));
      });
    } else if (value.length == 1) {
      result.push(this.setVal(value[0],valueLocation));
    }
    return result;
  }

}
