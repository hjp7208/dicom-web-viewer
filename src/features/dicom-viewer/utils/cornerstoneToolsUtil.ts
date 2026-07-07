import * as cornerstoneTools from '@cornerstonejs/tools';

export const DICOM_TOOL_GROUP_ID = 'dicom_tool_group';

export const DICOM_TOOLS = [
  cornerstoneTools.PanTool,
  cornerstoneTools.ZoomTool,
  cornerstoneTools.WindowLevelTool,
  cornerstoneTools.StackScrollTool,
  cornerstoneTools.LengthTool,
  cornerstoneTools.AngleTool,
  cornerstoneTools.RectangleROITool,
];

export const addAllTools = () => {
  DICOM_TOOLS.forEach(tool => cornerstoneTools.addTool(tool));
};

export const setupToolGroup = () => {
  let toolGroup = cornerstoneTools.ToolGroupManager.getToolGroup(DICOM_TOOL_GROUP_ID);
  if (!toolGroup) {
    toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(DICOM_TOOL_GROUP_ID);
    DICOM_TOOLS.forEach(tool => {
      toolGroup?.addTool(tool.toolName);
    });
  }
  return toolGroup;
};
