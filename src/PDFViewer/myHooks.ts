/*
 * @Date: 2019-11-01 16:25:18
 * @LastEditors: Tian Zhi
 * @LastEditTime: 2019-11-01 16:25:55
 */
import { useRef, useEffect } from "react";

export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
