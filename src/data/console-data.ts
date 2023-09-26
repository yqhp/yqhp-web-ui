export enum UserStatus {
  Disabled = 0,
  Enabled = 1
}

export const userStatusList = [
  {
    label: "启用",
    value: 1
  },
  {
    label: "禁用",
    value: 0
  }
]

export const enum DeviceStatus {
  Idle = 1,
  Busy = 2,
  Offline = 3
}

export const deviceStatusList = [
  {
    label: "闲置",
    value: 1,
    type: "success"
  },
  {
    label: "繁忙",
    value: 2,
    type: "danger"
  },
  {
    label: "离线",
    value: 3,
    type: "info"
  }
]

export const enum DeviceType {
  Real = 1,
  Emulator = 2
}

export const deviceTypeList = [
  {
    label: "真机",
    value: 1,
    color: ""
  },
  {
    label: "模拟器",
    value: 2,
    color: "orange"
  }
]

export const enum DevicePlatform {
  Android = 1,
  iOS = 2
}

export const devicePlatformList = [
  {
    label: "Android",
    value: 1,
    icon: "android"
  },
  {
    label: "iOS",
    value: 2,
    icon: "ios"
  }
]

export enum PkgType {
  Doc = 1
}

export enum TreeNodeType {
  Pkg = "PKG",
  Doc = "DOC"
}

export enum DocKind {
  JshInit = 1,
  JshAction = 2
}

export const docKindList = [
  {
    label: "初始化",
    value: 1,
    icon: "jsh-init"
  },
  {
    label: "Action",
    value: 2,
    icon: "jsh-action"
  }
]

export enum DocFlow {
  KeepRunningNextIfError = 1,
  StopRunningNextIfError = 2
}

export const docFlowList = [
  {
    label: "失败继续",
    value: 1,
    icon: "keep-running-next-if-error"
  },
  {
    label: "失败终止",
    value: 2,
    icon: "stop-running-next-if-error"
  }
]

export enum DocStatus {
  Draft = 1,
  Disabled = 2,
  Deprecated = 3,
  Released = 4
}

export const docStatusList = [
  {
    label: "草稿",
    value: 1,
    color: "",
    icon: "draft"
  },
  {
    label: "禁用",
    value: 2,
    color: "red",
    icon: "disabled"
  },
  {
    label: "过时",
    value: 3,
    color: "orange",
    icon: "deprecated"
  },
  {
    label: "发布",
    value: 4,
    color: "green",
    icon: "released"
  }
]

export enum PlanRunMode {
  Agent = 0,
  Efficient = 1,
  Compatible = 2,
  Selenium = 3
}

export const planRunModeList = [
  {
    label: "Agent模式",
    value: 0
  },
  {
    label: "Selenium模式",
    value: 3
  },
  {
    label: "[移动端]高效模式",
    value: 1
  },
  {
    label: "[移动端]兼容模式",
    value: 2
  }
]

export enum ExecutionStatus {
  Todo = 0,
  Started = 1,
  Successful = 2,
  Failed = 3
}

export const executionStatusList = [
  {
    label: "待执行",
    value: 0,
    type: "info"
  },
  {
    label: "执行中",
    value: 1,
    type: ""
  },
  {
    label: "成功",
    value: 2,
    type: "success"
  },
  {
    label: "失败",
    value: 3,
    type: "danger"
  },
  {
    label: "跳过",
    value: 4,
    type: "warning"
  }
]

export const rootPid = "0"
