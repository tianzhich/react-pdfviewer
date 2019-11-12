/**
 * @Date: 2019-11-11 18:00:44
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-12 18:11:39
 */
import React, { SFC } from "react";
import "./EsignDragable.css";
import KwaiLogo from "../assets/sign-stamp.png";
import { DragType, DragPosition } from ".";
import { useDrag, DragObjectWithType, useDrop } from "react-dnd";

type Prop = {
  type: DragType;
  id?: number;
};

export interface DragObject extends DragObjectWithType {
  id: number;
  type: DragType;
  pos?: DragPosition;
}

const EsignDragable: SFC<Prop> = props => {
  const { type, id = -1 } = props;

  // 定义Draggable
  const [, dragWrapper] = useDrag<DragObject, {}, {}>({
    item: { type, id }
  });

  return (
    <div className="esign-dragable">
      <img src={KwaiLogo} alt="" ref={dragWrapper} />
    </div>
  );
};

export default EsignDragable;
