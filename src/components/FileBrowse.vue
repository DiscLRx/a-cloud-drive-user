<template>
  <a-layout>
    <hr>
    <a-layout-content style="background: #fff; margin: 0 1rem;">
      <a-breadcrumb style="margin: 0.5rem;" class="path-breadcrumb">
        <a-breadcrumb-item>
          <a-button style="margin: 0; padding: 0; height: min-content;" type="text" @click="changeToRoot">
            我的文件
          </a-button>
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="(dir, index) in directoryPathArr">
          <a-button style="margin: 0; padding: 0; height: min-content" type="text" @click="backToDirectory(index)">
            {{ dir.name }}
          </a-button>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </a-layout-content>
    <hr>
    <a-layout-content style="background: #fff; margin: 0 1rem;">
      <div style="display: flex; flex-direction: row; justify-content: space-between">
        <div>
          <a-button style="margin: 0.5rem;" @click="showCreateDirectoryModal" v-if="!isSearchDisplay">创建目录
          </a-button>
          <a-modal v-model:open="createDirectoryModalState" title="创建目录" :width="300">
            <a-input v-model:value="createDirectoryName" placeholder="目录名称" :maxlength="255"/>
            <template #footer>
              <a-button @click="createDirectory()" type="primary">创建</a-button>
            </template>
          </a-modal>
          <a-button style="margin: 0.5rem" @click="showImportShareModal">导入分享</a-button>
          <a-modal v-model:open="importShareModalState" title="导入分享" :width="importShareModalWidth"
                   @cancel="clearImportShare">
            <template v-if="importShareStep === 1">
              <a-input v-model:value="importShareCode" placeholder="分享码" :maxlength="255"/>
              <a-input v-model:value="importShareKey" placeholder="密码" :maxlength="64" :style="{marginTop: '1rem'}"/>
            </template>
            <template v-else-if="importShareStep === 2">
              <a-descriptions bordered :column="1" :labelStyle="{width: '7rem', textAlign: 'center'}" size="small">
                <a-descriptions-item label="名称">{{ importShareItem.name }}</a-descriptions-item>
                <a-descriptions-item label="大小">{{ importShareItem.size }}</a-descriptions-item>
                <a-descriptions-item label="过期时间">{{ importShareItem.expire }}</a-descriptions-item>
              </a-descriptions>
            </template>
            <template v-else-if="importShareStep === 3">
              <SelectDirectory :root-id="rootId" @select-dir="setImportShareDirectory"/>
            </template>
            <template #footer v-if="importShareStep === 1">
              <a-button @click="loadImportShareItem" type="primary">查看</a-button>
            </template>
            <template #footer v-else-if="importShareStep === 2">
              <a-button @click="showImportShareSelectDirectory" type="primary">保存</a-button>
            </template>
            <template #footer v-else-if="importShareStep === 3">
              <a-button @click="importShare" type="primary">保存到此处</a-button>
            </template>
          </a-modal>
          <a-button style="margin: 0.5rem" @click="selectAndUploadFile" v-if="!isSearchDisplay">上传文件</a-button>
          <span v-show="showProgressBar">
            {{ uploadState }}
            <a-progress :percent="progressBarPercent" :style="{width: '200px'}"/>
          </span>
        </div>
        <div style="">
          <a-input-search
              style="margin: 0.5rem; width: 15rem"
              v-model:value="searchString"
              placeholder="搜索"
              enter-button
              @search="search"/>
        </div>
      </div>
    </a-layout-content>
    <a-layout-content style="background: #fff; margin: 0 1rem;" class="browse-area">
      <a-table :columns="columns" :data-source="directoryItems" :pagination="false" :scroll="{y: tableHeight}">
        <template #bodyCell="{ column, record }">
          <div>
            <template v-if="column.key === 'name'">
              <template v-if="record.isFile">
                <span>📄 </span>{{ record.name }}
              </template>
              <template v-else>
                <span>📁 </span>{{ record.name }}
              </template>
            </template>
            <template v-else-if="column.key === 'directoryPath'">
              {{ '/' + record.directoryPath }}
            </template>
            <template v-else-if="column.key === 'action'">
              <span>
                <template v-if="record.isFile">
                  <a @click="download(record)">下载</a>
                </template>
                <template v-else>
                  <template v-if="isSearchDisplay">
                    <a @click="jumpToDirectory(record)">打开</a>
                  </template>
                  <template v-else>
                    <a @click="nextDirectory(record)">打开</a>
                  </template>
                </template>
                <a-divider type="vertical"/>
                <a @click="prepareRenameModal(record.id)">重命名</a>
                <a-divider type="vertical"/>
                <a @click="prepareMoveModal(record.id)">移动</a>
                <a-divider type="vertical"/>
                <a @click="prepareCreateShareModal(record.id)">分享</a>
                <a-divider type="vertical"/>
                <a @click="deleteItem(record.id)">删除</a>
              </span>
            </template>
          </div>
        </template>
      </a-table>
      <a-modal v-model:open="renameModalState" title="重命名" :width="300">
        <a-input v-model:value="itemNewName" placeholder="新名称" :maxlength="255"/>
        <template #footer>
          <a-button @click="renameItem" type="primary">重命名</a-button>
        </template>
      </a-modal>
      <a-modal v-model:open="moveModalState" title="移动" :width="650">
        <SelectDirectory v-if="moveModalState" :root-id="rootId" @select-dir="setMoveTargetDirId"/>
        <template #footer>
          <a-button @click="moveItem" type="primary">移动到此处</a-button>
        </template>
      </a-modal>
      <a-modal v-model:open="createShareModalState" title="创建分享" width="16rem" @cancel="clearCreateShare">
        <a-date-picker show-time
                       placeholder="过期时间"
                       v-model:value="createShareExpireDate"/>
        <a-input v-model:value="createShareKey"
                 placeholder="设置分享密码"
                 :maxlength="64"
                 :status="createShareKeyStatus ? '' : 'error'"
                 @change="createShareKeyStatus = createShareKey.length >= 4"
                 :style="{marginTop: '1rem'}"/>
        <a-input v-model:value="createdShareCode"
                 placeholder="分享码"
                 readonly="readonly"
                 :style="{marginTop: '1rem'}"
                 v-if="canCopyShareCode"/>
        <template #footer>
          <template v-if="canCopyShareCode">
            <a-button class="copy" type="primary" :data-clipboard-text="createShareLink()"
                      @click="message.success('已复制到剪贴板')">
              复制分享链接
            </a-button>
          </template>
          <template v-else>
            <a-button @click="createShare" type="primary">分享</a-button>
          </template>
        </template>
      </a-modal>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import {onMounted, ref} from "vue";
import arRequest from '/src/script/auto-refresh-request.js'
import FileHash from '/src/script/file-hash.js'
import {message} from "ant-design-vue";
import SelectDirectory from "./SelectDirectory.vue";
import dayjs from "dayjs";
import ClipboardJS from "clipboard";
import {renderSize} from "../script/render-size.js";
import router from "../router.js";
import range from "../script/range.js";

const tableHeight = document.body.clientHeight - 300

const directoryPathArr = ref([])

const browseColumns = [
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name',
    width: '65%'
  },
  {
    title: '操作',
    key: 'action',
    width: '35%'
  },
]

const searchColumns = [
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name',
    width: '30%'
  },
  {
    title: '位置',
    dataIndex: 'directoryPath',
    key: 'directoryPath',
    width: '40%'
  },
  {
    title: '操作',
    key: 'action',
    width: '30%'
  },
]

const columns = ref(browseColumns);
const isSearchDisplay = ref(false)
const directoryItems = ref([])

function currentDirectoryId() {
  const pathLen = directoryPathArr.value.length
  if (pathLen === 0) {
    return rootId
  } else {
    return directoryPathArr.value[pathLen - 1].id
  }
}

// --------------- 展示数据 ------------------

let rootId = localStorage.getItem('rootId')
if (rootId === null) {
  arRequest('/api/file/items/root/id', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    if (res.code === 0) {
      rootId = res.data.rootId
      localStorage.setItem('rootId', rootId)
      return rootId
    } else {
      throw new Error()
    }
  }).then(async rootId => {
    await setDirectoryItems(rootId)
  })
} else {
  setDirectoryItems(rootId)
}

async function setDirectoryItems(parentId) {
  await arRequest(`/api/file/items/${parentId}/children`, {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      isSearchDisplay.value = false
      columns.value = browseColumns
      directoryItems.value = res.data
    } else {
      throw new Error()
    }
  })
}

function changeToRoot() {
  setDirectoryItems(rootId)
      .then(() => directoryPathArr.value = [])
}

function nextDirectory(dirItem) {
  setDirectoryItems(dirItem.id)
      .then(() => directoryPathArr.value.push(dirItem))
}

function backToDirectory(index) {
  const dirItem = directoryPathArr.value[index]
  setDirectoryItems(dirItem.id)
      .then(() => directoryPathArr.value = directoryPathArr.value.slice(0, index + 1))
}

async function jumpToDirectory(dirItem) {
  const id = dirItem.id
  await arRequest(`/api/file/items/${id}/path-items`, {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      return res.data
    } else {
      throw new Error()
    }
  }).then(pathItems => {
    pathItems.sort((a, b) => a.order - b.order)
    setDirectoryItems(id)
        .then(() => directoryPathArr.value = pathItems)
  })
}

function refreshDirectoryItem() {
  if (isSearchDisplay.value) {
    search()
  } else {
    const dirId = currentDirectoryId()
    setDirectoryItems(dirId)
  }
}

// ----------------- 搜索 -------------------


const searchString = ref('')

async function search() {
  return arRequest(`/api/file/items/search?search=${searchString.value}`, {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      return res.data
    } else {
      throw new Error()
    }
  }).then(data => {
    isSearchDisplay.value = true
    columns.value = searchColumns
    directoryItems.value = data
  })
}

// --------------- 创建目录 ------------------

const createDirectoryModalState = ref(false);

function showCreateDirectoryModal() {
  createDirectoryModalState.value = true
}

const createDirectoryName = ref('')

function createDirectory() {
  if (createDirectoryName.value.length === 0) {
    message.warning('目录名称不能为空')
    return
  }
  if (createDirectoryName.value.length > 255) {
    message.warning('目录名称不能超过255个字符')
    return;
  }
  const invalidChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
  for (const invalidChar of invalidChars) {
    if (createDirectoryName.value.includes(invalidChar)) {
      message.warning('目录名称包含非法字符')
      return
    }
  }
  const parentId = currentDirectoryId()
  arRequest('/api/file/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      parentId: parentId,
      name: createDirectoryName.value
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('创建目录成功')
      refreshDirectoryItem()
    } else if (res.code === 3004) {
      message.warning('目录已存在')
    } else {
      throw new Error()
    }
  }).finally(() => {
    createDirectoryName.value = ''
    createDirectoryModalState.value = false
  })
}

// ---------------- 上传 --------------------

function selectAndUploadFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = false
  input.click()
  input.onchange = upload
}

let chunkSize
let chunkCount
let uploadKey

const showProgressBar = ref(false)
const progressBarPercent = ref(0)
const uploadState = ref('')
const upload = async (event) => {
  const file = event.target.files[0]

  showProgressBar.value = true
  progressBarPercent.value = 0
  uploadState.value = '准备中'
  const headHash = await FileHash.fileHeadHash(file, 32 * 32)
  const entiretyHash = await FileHash.fileEntiretyHash(file)
  const fileSize = file.size
  const dirId = currentDirectoryId()

  await arRequest('/api/file/upload/hash', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: fileSize,
      dirId: dirId,
      headHash: headHash,
      entiretyHash: entiretyHash
    })
  })
      .then(async res => {
        if (res.code === 3004) {
          message.warning('文件已存在')
          showProgressBar.value = false
          progressBarPercent.value = 0
        } else if (res.code === 2001) {
          message.warning('空间不足')
          showProgressBar.value = false
          progressBarPercent.value = 0
        } else if (res.code === 2000 || res.code === 0) {
          uploadState.value = '上传中'
          if (res.code === 2000) {
            chunkSize = res.data.chunkSize
            chunkCount = res.data.chunkCount
            uploadKey = res.data.uploadKey
            await physicalUpload(file)
          }
          progressBarPercent.value = 100
          uploadState.value = '上传完成'
          message.success('上传完成')
          setTimeout(() => {
            showProgressBar.value = false
            progressBarPercent.value = 0
          }, 3000)
          refreshDirectoryItem()
        }
      })
}

async function physicalUpload(file) {
  for (let i = 0; i < chunkCount; ++i) {
    while (!await uploadChunk(file, i)) {
    }
    progressBarPercent.value = parseFloat(((i / chunkCount) * 100).toFixed(2))
  }
  await uploadConfirm()
}

async function uploadChunk(file, chunkSerial) {
  const chunkBegin = chunkSerial * chunkSize
  const chunkEnd = Math.min((chunkSerial + 1) * chunkSize, file.size)
  let chunk = file.slice(chunkBegin, chunkEnd)
  const chunkHashTask = FileHash.fileSegmentHash(file, chunkBegin, chunkEnd)
  const uploadTask = arRequest(`/api/file/upload/physical/chunk/${uploadKey}/${chunkSerial}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: chunk,
  })
      .then(res => res.data.hash)
  const chunkHash = await chunkHashTask
  const uploadHash = await uploadTask
  return uploadHash === chunkHash
}

async function uploadConfirm() {
  return arRequest(`/api/file/upload/physical/confirm/${uploadKey}`, {
    method: 'POST',
  }).then(async res => {
    if (res.code === 3005) {
      message.error('上传失败')
    }
  })
}

// ---------------- 下载 ----------------

async function getDownloadLink(id) {
  return await arRequest(`/api/file/download/items/${id}`, {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      return res.data.url
    } else if (res.code === 2002) {
      message.warning('等待后台处理文件')
    } else if (res.code === 3009) {
      message.warning('文件已被管理员锁定')
    }
    throw new Error()
  })
}

function download(dirItem) {
  getDownloadLink(dirItem.id)
      .then(url => {
        const name = dirItem.name
        dirItem.name = `⬇️ ${dirItem.name}`
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.responseType = 'blob'
        xhr.onload = function () {
          const a = document.createElement('a')
          a.href = window.URL.createObjectURL(this.response)
          a.download = name
          a.click()
          dirItem.name = name
        }
        xhr.send()
      }).catch(() => {
  })
}

// -------------- 删除 --------------

function deleteItem(id) {
  arRequest(`/api/file/items/${id}`, {
    method: 'DELETE'
  }).then(() => {
    refreshDirectoryItem()
  })
}

// ------------ 重命名 --------------

const renameModalState = ref(false);

let renameItemId
const itemNewName = ref('')

function prepareRenameModal(id) {
  renameItemId = id
  renameModalState.value = true
}

function renameItem() {
  arRequest(`/api/file/items/${renameItemId}/rename`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      newName: itemNewName.value
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('重命名成功')
      refreshDirectoryItem()
    } else if (res.code === 3004) {
      message.warning('目录已存在')
    } else {
      throw new Error()
    }
  }).finally(() => {
    itemNewName.value = ''
    renameModalState.value = false
  })
}

// --------------- 移动目录 --------------

const moveModalState = ref(false);

let moveItemId
let moveTargetDirId

function prepareMoveModal(id) {
  moveItemId = id
  moveModalState.value = true
}

function setMoveTargetDirId(dirId) {
  moveTargetDirId = dirId
}

function moveItem() {
  console.log(moveTargetDirId, moveItemId)
  arRequest(`/api/file/items/${moveItemId}/move`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      targetDirId: moveTargetDirId
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('移动成功')
      refreshDirectoryItem()
    } else if (res.code === 3004) {
      message.warning('同名目录项已存在')
    } else if (res.code === 3008) {
      message.warning('目标目录是当前目录的子目录')
    } else {
      throw new Error()
    }
  }).finally(() => {
    moveModalState.value = false
  })
}

// -------------- 创建分享 -----------------

new ClipboardJS('.copy')

const createShareModalState = ref(false)

let createShareItemId
const createShareExpireDate = ref()
const createShareKey = ref('')
const createShareKeyStatus = ref(true)

const canCopyShareCode = ref(false)
const createdShareCode = ref('')

function prepareCreateShareModal(id) {
  createShareItemId = id
  createShareModalState.value = true
}

async function createShare() {
  if (createShareKey.value.length < 4) {
    createShareKeyStatus.value = false
    return
  }

  let ts
  try {
    ts = createShareExpireDate.value.valueOf()
  } catch {
    return;
  }

  return arRequest('/api/file/share/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      itemId: createShareItemId,
      ts: ts,
      key: createShareKey.value
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('创建分享成功')
      createdShareCode.value = res.data.code
      canCopyShareCode.value = true
    }
  })
}

function createShareLink() {
  const protocol = location.protocol
  const host = location.host
  return `${protocol}://${host}/main/files?action=save&code=${createdShareCode.value}&key=${createShareKey.value}`
}

function clearCreateShare() {
  createShareItemId = ''
  createShareExpireDate.value = null
  createShareKey.value = ''
  createdShareCode.value = ''
  canCopyShareCode.value = false
}

// ------------- 导入分享 ----------------

const importShareStep = ref(1)
const importShareModalWidth = ref(300)
const importShareModalState = ref(false)
const importShareCode = ref('')
const importShareKey = ref('')
const importShareItem = ref({})
const importShareDirectoryId = ref('')

function showImportShareModal() {
  importShareModalWidth.value = 300
  importShareStep.value = 1
  importShareModalState.value = true
}

const shareCodeReg = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/

async function loadImportShareItem() {
  if (!shareCodeReg.test(importShareCode.value)) {
    message.warning('找不到可用的分享')
    return
  }
  arRequest(`/api/file/share/${importShareCode.value}?key=${importShareKey.value}`, {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      const data = res.data
      const expire = dayjs(data.expire).format('YYYY/MM/DD HH:mm:ss')
      const size = renderSize(data.size)
      importShareItem.value = {
        name: data.name,
        size: size,
        expire: expire
      }
      importShareModalWidth.value = 500
      importShareStep.value = 2
    } else {
      message.warning('找不到可用的分享')
    }
  })
}

function setImportShareDirectory(dirId) {
  importShareDirectoryId.value = dirId
}

async function showImportShareSelectDirectory() {
  importShareModalWidth.value = 650
  importShareStep.value = 3
}

async function importShare() {
  console.log(importShareCode.value, importShareKey.value, importShareDirectoryId.value)
  await arRequest('/api/file/share/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: importShareCode.value,
      key: importShareKey.value,
      dirId: importShareDirectoryId.value
    })
  }).then(res => {
    if (res.code === 0) {
      message.success('保存分享成功')
      clearImportShare()
      refreshDirectoryItem()
    } else if (res.code === 3004) {
      message.warning('存在相同名称的项目')
    } else {
      throw new Error()
    }
  })
}

function clearImportShare() {
  importShareStep.value = 1
  importShareModalWidth.value = 300
  importShareModalState.value = false
  importShareCode.value = ''
  importShareKey.value = ''
  importShareItem.value = {}
  importShareDirectoryId.value = ''
}

onMounted(() => {
  const query = router.currentRoute.value.query
  if (query['action'] !== 'save') {
    return
  }
  importShareStep.value = 1
  importShareCode.value = query['code']
  importShareKey.value = query['key']
  showImportShareModal()
})

</script>

<style scoped>
.browse-area {
  padding: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.path-breadcrumb * {
  color: rgb(22, 119, 255);
  font-family: "Microsoft YaHei UI", sans-serif;
  font-weight: 500;
}
</style>