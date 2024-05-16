import router from "../router.js";

export default (url, options) => {
    let token = localStorage.getItem('token')
    if (token === null) {
        return router.push('/sign-in')
    }
    setHeaderAuthorization(options, token)
    return fetch(url, options)
        .then(res => res.json())
        .then(async res => {
            if (res.code === 1001) {
                token = await refreshToken(token)
                if (token === false) {
                    await router.push('/sign-in')
                    return {code: 0}
                }
                setHeaderAuthorization(options, token)
                return fetch(url, options)
                    .then(res => res.json())
            } else if (res.code === 1002) {
                clearToken()
                return router.push('/sign-in')
            } else {
                return res
            }
        })
}

const refreshToken = async (token) => fetch('/api/identity/auth/refresh-token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token: token
    })
})
    .then(res => res.json())
    .then(res => {
        if (res.code ===0){
            const token = res.data.token
            localStorage.setItem('token', token)
            return token
        } else if (res.code === 1002) {
            clearToken()
            return false
        }
    })

function setHeaderAuthorization(options, token) {
    if (options.headers === undefined) {
        options.headers = {}
    }
    options.headers['Authorization'] = `Bearer ${token}`
}

function clearToken () {
    localStorage.removeItem('token')
}