import { constantRoutes } from '@/router'
import { getRouters } from '@/api/system/menu'
import Layout from '@/layout/index'
import ParentView from '@/components/ParentView'
import InnerLink from '@/layout/components/InnerLink'
import cache from '@/plugins/cache'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: [],
    commonlyUsedRoutes: [] //常用路由
  }),
  actions: {
    setRoutes(routes) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    setDefaultRoutes(routes) {
      this.defaultRoutes = constantRoutes.concat(routes)
    },
    setTopbarRoutes(routes) {
      this.topbarRouters = routes
    },
    setSidebarRouters(routes) {
      this.sidebarRouters = routes
    },
    // 生成路由
    generateRoutes() {
      return new Promise((resolve) => {
        // 向后端请求路由数据
        let routes = [
          {
            alwaysShow: true,
            hidden: false,
            name: 'system',
            path: '/system',
            redirect: 'noRedirect',
            meta: {
              title: '系统管理',
              icon: 'system',
              noCache: false,
              titleKey: 'menu.system',
              link: '',
              isNew: 1,
              iconColor: null,
              permi: null
            },
            children: [
              {
                alwaysShow: false,
                hidden: false,
                name: 'user',
                path: 'user',
                redirect: null,
                meta: {
                  title: '用户管理',
                  icon: 'user',
                  noCache: false,
                  titleKey: 'menu.systemUser',
                  link: '',
                  isNew: 1,
                  iconColor: null,
                  permi: null
                },
                component: 'system/user/index'
              },
              {
                alwaysShow: false,
                hidden: false,
                name: 'role',
                path: 'role',
                redirect: null,
                meta: {
                  title: '角色管理',
                  icon: 'peoples',
                  noCache: false,
                  titleKey: 'menu.systemRole',
                  link: '',
                  isNew: 1,
                  iconColor: null,
                  permi: null
                },
                component: 'system/role/index'
              },
              {
                alwaysShow: false,
                hidden: false,
                name: 'dept',
                path: 'dept',
                redirect: null,
                meta: {
                  title: '部门管理',
                  icon: 'tree',
                  noCache: false,
                  titleKey: 'menu.systemDept',
                  link: '',
                  isNew: 1,
                  iconColor: null,
                  permi: null
                },
                component: 'system/dept/index'
              }
            ],
            component: 'Layout'
          },
          {
            alwaysShow: true,
            hidden: false,
            name: 'forward',
            path: '/forward',
            redirect: 'noRedirect',
            meta: {
              title: '传阅系统',
              icon: 'build',
              noCache: false,
              titleKey: '',
              link: '',
              isNew: 1,
              iconColor: null,
              permi: null
            },
            children: [
              {
                alwaysShow: false,
                hidden: false,
                name: 'allfiles',
                path: 'allFiles',
                redirect: null,
                meta: {
                  title: '我的文件',
                  icon: 'download',
                  noCache: false,
                  titleKey: '',
                  link: '',
                  isNew: 1,
                  iconColor: null,
                  permi: null
                },
                component: 'forword/allFiles/index'
              },
              {
                alwaysShow: false,
                hidden: true,
                name: 'folder',
                path: 'folder',
                redirect: null,
                meta: {
                  title: '文件夹',
                  noCache: false,
                  titleKey: '',
                  link: '',
                  isNew: 1,
                  iconColor: null,
                  permi: null
                },
                component: 'forword/allFiles/detail'
              },
              {
                alwaysShow: false,
                hidden: false,
                name: 'starred',
                path: 'starred',
                redirect: null,
                meta: {
                  title: '收藏',
                  icon: 'rate',
                  noCache: false,
                  titleKey: '',
                  link: '',
                  isNew: 1,
                  iconColor: null,
                  permi: null
                },
                component: 'forword/allFiles/index'
              },
              {
                alwaysShow: false,
                hidden: false,
                name: 'transform',
                path: 'transform',
                redirect: null,
                meta: {
                  title: '传阅',
                  icon: 'guide',
                  noCache: false,
                  titleKey: '',
                  link: '',
                  isNew: 1,
                  iconColor: null,
                  permi: null
                },
                component: 'forword/transform/index'
              }
            ],
            component: 'Layout'
          }
        ]

        const sdata = JSON.parse(JSON.stringify(routes))
        const rdata = JSON.parse(JSON.stringify(routes))
        const defaultData = JSON.parse(JSON.stringify(routes))
        const sidebarRoutes = filterAsyncRouter(sdata)
        const rewriteRoutes = filterAsyncRouter(rdata, false, true)
        const defaultRoutes = filterAsyncRouter(defaultData)
        this.setRoutes(rewriteRoutes)
        this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
        this.setDefaultRoutes(sidebarRoutes)
        this.setTopbarRoutes(defaultRoutes)
        this.setCommonlyUsedRoutes()
        resolve(rewriteRoutes)

        // getRouters().then((res) => {
        //   const sdata = JSON.parse(JSON.stringify(res.data))
        //   const rdata = JSON.parse(JSON.stringify(res.data))
        //   const defaultData = JSON.parse(JSON.stringify(res.data))
        //   const sidebarRoutes = filterAsyncRouter(sdata)
        //   const rewriteRoutes = filterAsyncRouter(rdata, false, true)
        //   const defaultRoutes = filterAsyncRouter(defaultData)
        //   this.setRoutes(rewriteRoutes)
        //   this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
        //   this.setDefaultRoutes(sidebarRoutes)
        //   this.setTopbarRoutes(defaultRoutes)
        //   this.setCommonlyUsedRoutes()
        //   resolve(rewriteRoutes)
        // })
      })
    },
    // 设置常用路由
    setCommonlyUsedRoutes() {
      var arraryObjectLocal = cache.local.getJSON('commonlyUseMenu') || []
      this.commonlyUsedRoutes = arraryObjectLocal
    },
    // 移除常用路由
    removeCommonlyUsedRoutes(item) {
      var routes = this.commonlyUsedRoutes

      const fi = routes.findIndex((v) => v.path === item.path)
      routes.splice(fi, 1)
      cache.local.setJSON('commonlyUseMenu', routes)
    }
  }
})

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else if (route.component === 'InnerLink') {
        route.component = InnerLink
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach((c) => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view) => {
  let res
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === view) {
      res = () => modules[path]()
    }
  }
  return res
}

export default usePermissionStore
