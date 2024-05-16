<template>
  <a-layout>
    <a-layout-content
        style="background: #fff; margin: 1rem; padding: 6rem; display: flex; justify-content: center; align-items: center">

      <a-descriptions bordered :column="1" style="width: 50rem" :labelStyle="{width: '8rem', textAlign: 'center'}">
        <a-descriptions-item label="用户名">
          <div class="edit-line" v-if="editUsername">
            <a-input v-model:value="replaceUsername"
                     :status="usernameStatus ? '' : 'error'"
                     :style="{width: '15rem'}"/>
            <div class="edit-end">
              <a-button type="primary" @click="saveUsername">保存</a-button>
              <a-button type="default"
                        @click="editUsername = false; replaceUsername = user.username; usernameStatus = true">取消
              </a-button>
            </div>
          </div>
          <div class="edit-line" v-else>
            <span>{{ user.username }}</span>
            <a-button type="default" @click="editUsername = true">编辑</a-button>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="昵称">
          <div class="edit-line" v-if="editDisplayName">
            <a-input v-model:value="replaceDisplayName"
                     :status="displayNameStatus ? '' : 'error'"
                     :style="{width: '15rem'}"/>
            <div class="edit-end">
              <a-button type="primary" @click="saveDisplayName">保存</a-button>
              <a-button type="default"
                        @click="editDisplayName = false; replaceDisplayName = user.displayName; displayNameStatus = true">
                取消
              </a-button>
            </div>
          </div>
          <div class="edit-line" v-else>
            <span>{{ user.displayName }}</span>
            <a-button type="default" @click="editDisplayName = true">编辑</a-button>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="邮箱">
          <div v-if="editEmail">
            <div class="edit-line">
              <a-input v-model:value="replaceEmail"
                       :status="emailStatus ? '' : 'error'"
                       :style="{width: '15rem'}"/>
              <div class="edit-end">
                <a-button type="primary" @click="saveEmail">保存</a-button>
                <a-button type="default" @click="editEmail = false; replaceEmail = user.email; vCode = ''">取消
                </a-button>
              </div>
            </div>
            <div style="display: flex; flex-direction: row; justify-content: flex-start; margin-top: 0.5rem">
              <a-input v-model:value="vCode"
                       :status="vCodeStatus ? '' : 'error'"
                       :style="{width: '8rem'}"/>
              <a-button type="default"
                        style="margin-left: 1rem; width: 6rem"
                        :disabled="sendCodeTimeWait > 0"
                        @click="sendVerificationCode" >{{ codeButtonText }}</a-button>
            </div>
          </div>
          <div class="edit-line" v-else>
            <span>{{ user.email }}</span>
            <a-button type="default" @click="editEmail = true">编辑</a-button>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="密码">
          <div class="edit-line" v-if="editPassword">
            <a-input-password v-model:value="replacePassword"
                     :status="passwordStatus ? '' : 'error'"
                     :style="{width: '15rem'}"/>
            <div class="edit-end">
              <a-button type="primary" @click="savePassword">保存</a-button>
              <a-button type="default" @click="editPassword = false; replacePassword = ''">取消</a-button>
            </div>
          </div>
          <div class="edit-line" v-else>
            <span>******</span>
            <a-button type="default" @click="editPassword = true">编辑</a-button>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="总容量">
          {{ renderSize(user.totalSpace) }}
        </a-descriptions-item>
        <a-descriptions-item label="已用容量">
          {{ renderSize(user.usedSpace) }}
        </a-descriptions-item>
      </a-descriptions>

    </a-layout-content>
  </a-layout>
</template>

<script setup>

import {ref} from "vue";
import arRequest from '/src/script/auto-refresh-request.js'
import {message} from "ant-design-vue";
import {renderSize} from "../script/render-size.js";

const emit = defineEmits(['refreshDisplayName'])

const user = ref({})

loadUser().then(() => {
  replacePassword.value = ''
  replaceUsername.value = user.value.username
  replaceDisplayName.value = user.value.displayName
  replaceEmail.value = user.value.email
})


const editUsername = ref(false)
const editDisplayName = ref(false)
const editPassword = ref(false)
const editEmail = ref(false)

const replaceUsername = ref('')
const replaceDisplayName = ref('')
const replaceEmail = ref('')
const vCode = ref('')
const replacePassword = ref('')

async function loadUser() {
  return arRequest('/api/identity/user/current', {
    method: 'GET'
  }).then(res => {
    console.log(res)
    if (res.code === 0) {
      user.value = res.data
      emit('refreshDisplayName', user.value.displayName)
    } else {
      throw new Error()
    }
  })
}

const usernameStatus = ref(true)

function saveUsername() {
  const reg = /^[A-Za-z0-9_]{4,50}$/
  usernameStatus.value = reg.test(replaceUsername.value)
  if (!usernameStatus.value) {
    return
  }
  arRequest('/api/identity/user/current/username', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: replaceUsername.value
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('修改成功')
      editUsername.value = false
      loadUser()
    } else if (res.code === 3000) {
      message.warning('格式不正确')
    } else if (res.code === 3001) {
      message.warning('用户名已存在')
    } else {
      throw new Error()
    }
  })
}

const displayNameStatus = ref(true)

function saveDisplayName() {
  const reg = /^.{1,50}$/
  displayNameStatus.value = reg.test(replaceDisplayName.value)
  if (!displayNameStatus.value) {
    return
  }
  arRequest('/api/identity/user/current/display-name', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: replaceDisplayName.value
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('修改成功')
      editDisplayName.value = false
      loadUser()
    } else if (res.code === 3000) {
      message.warning('格式不正确')
    } else {
      throw new Error()
    }
  })
}

const passwordStatus = ref(true)

function savePassword() {
  const reg = /^[A-Za-z0-9_]{4,50}$/
  passwordStatus.value = reg.test(replacePassword.value)
  if (!passwordStatus.value) {
    return
  }
  arRequest('/api/identity/user/current/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: replacePassword.value
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('修改成功')
      editPassword.value = false
      loadUser()
    } else if (res.code === 3000) {
      message.warning('格式不正确')
    } else {
      throw new Error()
    }
  })
}

const emailStatus = ref(true)
const codeButtonText = ref('获取验证码')
const sendCodeTimeWait = ref(0)
let key = ''

function setCodeTimeWait() {
  sendCodeTimeWait.value = 30
  codeButtonText.value = sendCodeTimeWait.value.toString()
  const interval = setInterval(() => {
    sendCodeTimeWait.value--
    codeButtonText.value = sendCodeTimeWait.value.toString()
    if (sendCodeTimeWait.value <= 0) {
      clearInterval(interval)
      codeButtonText.value = '获取验证码'
    }
  }, 1000)
}
function sendVerificationCode() {
  const reg = /^[\w\-\\.]+@([\w-]+\.)+[\w-]{2,}$/
  emailStatus.value = reg.test(replaceEmail.value)
  if (!emailStatus.value) {
    return
  }
  setCodeTimeWait()
  arRequest('/api/identity/user/current/email/vcode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: replaceEmail.value
    })
  }).then(res => {
    if (res.code === 0) {
      key = res.data.key
    }else if (res.code === 3002) {
      message.warning('邮箱已存在')
      sendCodeTimeWait.value = 0
    } else {
      throw new Error()
    }
  })
}

const vCodeStatus = ref(true)
function saveEmail() {
  const regEmail = /^[\w\-\\.]+@([\w-]+\.)+[\w-]{2,}$/
  const regCode = /^[0-9]{6}$/
  emailStatus.value = regEmail.test(replaceEmail.value)
  vCodeStatus.value = regCode.test(vCode.value)
  if (!emailStatus.value || !vCodeStatus.value) {
    console.log(replaceEmail.value ,vCodeStatus.value)
    return
  }
  arRequest('/api/identity/user/current/email', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: replaceEmail.value,
      code: vCode.value,
      key: key
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('修改成功')
      editEmail.value = false
      vCode.value = ''
      loadUser()
    } else if (res.code === 3006) {
      message.warning('验证码错误')
    }
  })
}


</script>

<style scoped>
.edit-line {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.edit-end {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 9rem;
}
</style>