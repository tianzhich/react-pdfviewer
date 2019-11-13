import { LoadingProcessData } from "react-pdf/dist/Page";
import { DragObject } from "src/EsignDragable/EsignDragable";

/*
 * @Date: 2019-11-04 16:05:57
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-12 19:11:12
 */

export interface PDFViewerInfo {
  pageNum?: number; // 当前页码
  numPages: number; // 总页数
  pageHeight: number; // 页高
  title?: string; // PDF标题
  pageScale: number;
}
export interface PDFRowItemData {
  onComputeHeight: (isThumbnail?: boolean) => void;
  pageScale: number;
}
export interface PDFThumbnailItemData {
  onClickThumbnail: (index: number) => void;
}
