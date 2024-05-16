import {createRouter, createWebHistory} from "vue-router"
import IndexView from "./views/IndexView.vue";
import SignIn from "./components/SignIn.vue";
import SignUp from "./components/SignUp.vue";
import MainView from "./views/MainView.vue";
import FileBrowse from "./components/FileBrowse.vue";
import ShareMagage from "./components/ShareMagage.vue";
import RecycleBin from "./components/RecycleBin.vue";
import ProfileManage from "./components/ProfileManage.vue";
import ForgetPassword from "./components/ForgetPassword.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            meta: {
                auth: false,
            },
            component: IndexView,
            children: [
                {
                    path: "sign-in",
                    meta: {
                        auth: false,
                    },
                    component: SignIn
                },
                {
                    path: "sign-up",
                    meta: {
                        auth: false,
                    },
                    component: SignUp
                },
                {
                    path: "forget",
                    meta: {
                        auth: false,
                    },
                    component: ForgetPassword
                }
            ]
        },
        {
            path: '/main',
            meta: {
                auth: true
            },
            component: MainView,
            children: [
                {
                    path: 'files',
                    meta: {
                        auth: true
                    },
                    component: FileBrowse
                },
                {
                    path: 'shares',
                    meta: {
                        auth: true
                    },
                    component: ShareMagage
                },
                {
                    path: 'recycle-bin',
                    meta: {
                        auth: true
                    },
                    component: RecycleBin
                },
                {
                    path: 'profile',
                    meta: {
                        auth: true
                    },
                    component: ProfileManage
                }
            ]
        }
    ]
});

router.beforeEach((to, from, next) => {
    const hasToken = localStorage.getItem("token") !== null
    if (to.meta.auth && !hasToken) {
        next("/sign-in")
    } else {
        if (to.path === "/") {
            next("/sign-in")
        } else {
            next()
        }
    }
})

export default router;