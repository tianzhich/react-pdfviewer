/**
 * @Date: 2019-11-04 15:59:15
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-04 18:52:58
 */
import React, { SFC } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import {
  THUMBNAIL_ITEM_HEIGHT,
  THUMBNAIL_WIDTH,
  CONTAINER_HEADER_HEIGHT
} from "./const";
import { PDFThumbnailItemData } from "./type";
import { Page } from "react-pdf";

type Prop = {
  numPages: number;
  onClickThumbnail: (index: number) => void;
  show?: boolean;
  height: number;
};

export interface PDFThumbnailProps extends ListChildComponentProps {
  data: PDFThumbnailItemData;
}

const PDFThumbnail = ({ index, style, data }: PDFThumbnailProps) => {
  const { onClickThumbnail } = data;
  return (
    <div style={style}>
      <div className="thumbnail-item" onClick={() => onClickThumbnail(index)}>
        <Page
          pageNumber={index + 1}
          height={THUMBNAIL_ITEM_HEIGHT}
          renderTextLayer={false}
        />
      </div>
      <div className="thumbnail-page-num">{index + 1}</div>
    </div>
  );
};

const Thumbnail: SFC<Prop> = props => {
  const { numPages, onClickThumbnail, show, height } = props;
  const thumbnailHeight = height - CONTAINER_HEADER_HEIGHT;
  const itemData: PDFThumbnailItemData = {
    onClickThumbnail
  };
  return (
    <List
      height={thumbnailHeight}
      itemCount={numPages}
      itemSize={THUMBNAIL_ITEM_HEIGHT + 20}
      itemData={itemData}
      width={THUMBNAIL_WIDTH}
      className={`pdf-viewer-thumbnail ${!show ? "hidden" : ""}`}
    >
      {PDFThumbnail}
    </List>
  );
};

export default Thumbnail;
