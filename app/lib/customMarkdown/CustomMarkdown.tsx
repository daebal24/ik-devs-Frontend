"use client";

import React, { useMemo } from "react";
import { parseCustomMarkdown, ImageMapItem } from "./parser";

type Props = {
  source: string;
  imageMap?: ImageMapItem[];
};

export default function CustomMarkdown({source, imageMap = []}: Props) {
  const nodes = useMemo(
    () => parseCustomMarkdown(source, imageMap),
    [source, imageMap]
  );

  return <>{nodes}</>;
}
