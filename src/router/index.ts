import { type RouteRecordRaw, createRouter } from "vue-router"
import { history, flatMultiLevelRoutes } from "./helper"
import routeSettings from "@/config/route"

const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },
  {
    path: "/coding",
    component: Layouts,
    redirect: "/coding/index",
    children: [
      {
        path: "index",
        component: () => import("@/views/coding/index.vue"),
        name: "Coding",
        meta: {
          title: "Coding",
          elIcon: "KnifeFork"
        }
      }
    ]
  },
  {
    path: "/plan",
    component: Layouts,
    redirect: "/plan/index",
    children: [
      {
        path: "index",
        component: () => import("@/views/plan/index.vue"),
        name: "Plan",
        meta: {
          title: "计划",
          svgIcon: "plan"
        }
      }
    ]
  },
  {
    path: "/executionRecord",
    component: Layouts,
    redirect: "/executionRecord/index",
    children: [
      {
        path: "index",
        component: () => import("@/views/executionRecord/index.vue"),
        name: "ExecutionRecord",
        meta: {
          title: "执行记录",
          svgIcon: "execution-record"
        }
      }
    ]
  },
  {
    path: "/report/:id",
    component: () => import("@/views/report/index.vue"),
    name: "Report",
    meta: {
      title: "报告",
      hidden: true
    }
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/system",
    component: Layouts,
    redirect: "/system/project",
    name: "System",
    meta: {
      title: "系统管理",
      elIcon: "Setting",
      roles: ["admin"],
      alwaysShow: true
    },
    children: [
      {
        path: "project",
        component: () => import("@/views/system/project/index.vue"),
        name: "SystemProject",
        meta: {
          title: "项目管理"
        }
      },
      {
        path: "user",
        component: () => import("@/views/system/user/index.vue"),
        name: "SystemUser",
        meta: {
          title: "用户管理"
        }
      },
      {
        path: "plugin",
        component: () => import("@/views/system/plugin/index.vue"),
        name: "SystemPlugin",
        meta: {
          title: "插件管理"
        }
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*", // Must put the 'ErrorPage' route at the end, 必须将 'ErrorPage' 路由放在最后
    redirect: "/404",
    name: "ErrorPage",
    meta: {
      hidden: true
    }
  }
]

const router = createRouter({
  history,
  routes: routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
