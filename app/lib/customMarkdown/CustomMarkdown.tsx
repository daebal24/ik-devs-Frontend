"use client";

import React, { useMemo } from "react";
import { parseCustomMarkdown, ImageMapItem, ParseOptions } from "./parser";

type Props = {
  source: string;
  imageMap?: ImageMapItem[];
  aoutClassName?: string;
};

export default function CustomMarkdown({source, imageMap = [], aoutClassName}: Props) {
  const opts: ParseOptions = { aoutClassName };
  const nodes = useMemo(
    () => parseCustomMarkdown(source, imageMap, opts),
    [source, imageMap, aoutClassName]
  );

  return <>{nodes}</>;
}
