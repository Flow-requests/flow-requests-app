import NativeNodeType from "@/types/native-node-type.type";

function parseBeforeRunOrSave(
  item: { [key: string]: any },
  mapNodesById: { [key: string]: any },
  ignoreNodeById: { [key: string]: any },
  index: number
) {
  if (item.type == NativeNodeType.start) {
    return {
      type: item.type,
      name: item.data.name,
      input: {},
      output: {},
    };
  } else if (item.type == NativeNodeType.code) {
    return {
      type: item.type,
      name: item.data.name,
      setting: {
        code: btoa(unescape(encodeURIComponent(item.data.code))),
        params: item.data.params,
      },
      input: {},
      output: {},
    };
  } else if (item.type == NativeNodeType.api) {
    return {
      type: item.type,
      name: item.data.name,
      setting: {
        method: item.data.method,
        url: item.data.endpoint,
        headers: item.data.headers,
        body: item.data.body,
      },
      input: {},
      output: {},
    };
  } else if (item.type == NativeNodeType.condition) {
    // @ts-ignore
    const left = item?.data?.condition?.left;
    const leftType = left.startsWith("this.state") ? "expression" : "raw";
    // @ts-ignore
    const right = item?.data?.condition?.right;
    const rightType = right.startsWith("this.state") ? "expression" : "raw";

    // @ts-ignore
    const operator = item?.data?.condition?.operator;

    const itemToAdd = {
      type: item.type,
      name: item.data.name,
      setting: {
        condition: {
          left: {
            type: leftType,
            value: left,
          },
          right: {
            type: rightType,
            value: right,
          },
          operator: operator,
        },
        success: [],
        fail: [],
      },
      input: {},
      output: {},
    };

    // @ts-ignore
    itemToAdd.setting.success = edges
      .filter((option: { [key: string]: any }) => {
        return (
          // @ts-ignore
          option.parentId == item.id && option.pathCondition == "true"
        );
      })
      .map((option: { [key: string]: any }) => {
        const node = mapNodesById[option.target];
        ignoreNodeById[node.id] = true;
        return parseBeforeRunOrSave(node, mapNodesById, ignoreNodeById, index);
      });

    // @ts-ignore
    itemToAdd.setting.fail = edges
      .filter((option: { [key: string]: any }) => {
        return (
          // @ts-ignore
          option.parentId == item.id && option.pathCondition == "false"
        );
      })
      .map((option: { [key: string]: any }) => {
        const node = mapNodesById[option.target];
        ignoreNodeById[node.id] = true;
        return parseBeforeRunOrSave(node, mapNodesById, ignoreNodeById, index);
      });

    return itemToAdd;
  } else if (item.type == NativeNodeType.loop) {
    const itemToAdd = {
      type: item.type,
      name: item.data.name,
      setting: {
        source: item.data.source || [],
        nodes: [],
      },
      input: {},
      output: {},
    };

    // @ts-ignore
    itemToAdd.setting.nodes = edges
      .filter((option: { [key: string]: any }) => {
        return (
          // @ts-ignore
          option.parentId == item.id && option.pathCondition == "loop"
        );
      })
      .map((option: { [key: string]: any }, index: number) => {
        const node = mapNodesById[option.target];
        ignoreNodeById[node.id] = true;
        return parseBeforeRunOrSave(node, mapNodesById, ignoreNodeById, index);
      });

    return itemToAdd;
  }

  const itemData = item.data;
  delete itemData.isCustomNode;
  delete itemData.name;

  const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
  item.data.name = `trigger_${typeLabel}_${index + 1}`.toLowerCase();

  return {
    type: item.type,
    name: item.data.name,
    setting: itemData,
    input: {},
    output: {},
  };
}

export { parseBeforeRunOrSave };
