/**
 * @Date: 2019-11-11 18:00:44
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-11 18:18:28
 */
export { default as EsignDragable } from "./EsignDragable";
export enum DragType {
  SignDrag = "SIGN_DRAG",
  SignStamp = "SIGN_STAMP"
}
export interface DragPosition {
  x: number;
  y: number;
}
