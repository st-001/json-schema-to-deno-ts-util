/**
 * AUTO-GENERATED FILE - DO NOT EDIT.
 * This file was automatically generated.
 * Any changes made to this file will be overwritten.
 */

import Ajv from "https://esm.sh/ajv@8.12.0";
import addFormats from "https://esm.sh/ajv-formats@2.1.1";
export interface Task {
  task:
    | "sendEmail"
    | "sendTeamsMessage"
    | "scheduleMeeting"
    | "getCustomer"
    | "getEmployee"
    | "sendWhatsAppMessage"
    | "unknown";
  taskDetails: string;
}
export interface TaskCompressed {
  1: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  2: string;
}
export class TaskUtil {
  private static ajv = (() => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    return ajv;
  })();
  static readonly TASK_ENUM = [
    "sendEmail",
    "sendTeamsMessage",
    "scheduleMeeting",
    "getCustomer",
    "getEmployee",
    "sendWhatsAppMessage",
    "unknown",
  ] as const;

  static readonly schema = Object.freeze(
    {
      "$id": "Task",
      "type": "object",
      "description": "A task",
      "properties": {
        "task": {
          "type": "string",
          "description": "The task name",
          "enum": [
            "sendEmail",
            "sendTeamsMessage",
            "scheduleMeeting",
            "getCustomer",
            "getEmployee",
            "sendWhatsAppMessage",
            "unknown",
          ],
          "default": "unknown",
        },
        "taskDetails": {
          "type": "string",
          "description": "All details required to complete the task",
          "default": "",
        },
      },
      "required": [
        "task",
        "taskDetails",
      ],
    } as const,
  );

  static readonly compressedSchema = Object.freeze(
    {
      "$id": "TaskCompressed",
      "type": "object",
      "description": "A task",
      "properties": {
        "1": {
          "type": "number",
          "description":
            "The task name Enum mapping: 0 = sendEmail, 1 = sendTeamsMessage, 2 = scheduleMeeting, 3 = getCustomer, 4 = getEmployee, 5 = sendWhatsAppMessage, 6 = unknown.",
          "enum": [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
          ],
          "default": 6,
        },
        "2": {
          "type": "string",
          "description": "All details required to complete the task",
          "default": "",
        },
      },
      "required": [
        "1",
        "2",
      ],
      "additionalProperties": false,
    } as const,
  );

  static readonly schemaString =
    '{"$id":"Task","type":"object","description":"A task","properties":{"task":{"type":"string","description":"The task name","enum":["sendEmail","sendTeamsMessage","scheduleMeeting","getCustomer","getEmployee","sendWhatsAppMessage","unknown"],"default":"unknown"},"taskDetails":{"type":"string","description":"All details required to complete the task","default":""}},"required":["task","taskDetails"]}' as const;

  static readonly compressedSchemaString =
    '{"$id":"TaskCompressed","type":"object","description":"A task","properties":{"1":{"type":"number","description":"The task name Enum mapping: 0 = sendEmail, 1 = sendTeamsMessage, 2 = scheduleMeeting, 3 = getCustomer, 4 = getEmployee, 5 = sendWhatsAppMessage, 6 = unknown.","enum":[0,1,2,3,4,5,6],"default":6},"2":{"type":"string","description":"All details required to complete the task","default":""}},"required":["1","2"],"additionalProperties":false}' as const;

  static validate = this.ajv.compile(this.schema);
  static validateCompressed = this.ajv.compile(this.compressedSchema);

  static decompress(compressedData: TaskCompressed): Task {
    if (!this.validateCompressed(compressedData)) {
      throw new Error(
        "Validation failed: " +
          this.ajv.errorsText(this.validateCompressed.errors),
      );
    }

    return {
      task: this.TASK_ENUM[compressedData["1"]],
      taskDetails: compressedData["2"],
    };
  }
}
