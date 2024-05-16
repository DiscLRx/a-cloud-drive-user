<template>
  <a-layout-content style="background: #fff; margin: 1rem;">
    <a-table :columns="columns" :data-source="shares" :pagination="false" :scroll="{y: tableHeight}">
      <template #bodyCell="{ column, record }">
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
          <a @click="showDetailModal(record.code)">详细信息</a>
          <a-divider type="vertical"/>
          <a @click="deleteShare(record.code)">删除</a>
        </template>
      </template>
    </a-table>
    <a-modal v-model:open="detailModalState" title="详细信息" :width="550" @cancel="clearDetail">
      <a-descriptions bordered :column="1" :labelStyle="{width: '7rem', textAlign: 'center'}" size="small">
        <a-descriptions-item label="名称">{{ shareDetail.name }}</a-descriptions-item>
        <a-descriptions-item label="位置">{{ shareDetail.directoryPath }}</a-descriptions-item>
        <a-descriptions-item label="大小">{{ shareDetail.size }}</a-descriptions-item>
        <a-descriptions-item label="过期时间">{{ shareDetail.expire }}</a-descriptions-item>
        <a-descriptions-item label="分享码">
          <div class="copy-field">
            <div>{{ shareDetail.code }}</div>
            <a-button class="copy" type="primary" :data-clipboard-text="shareDetail.code"
                      @click="message.success('已复制到剪贴板')">
              复制
            </a-button>
          </div>
        </a-descriptions-item>
        <a-descriptions-item label="密码">
          <div class="copy-field">
            <div>{{ shareDetail.key }}</div>
            <a-button class="copy" type="primary" :data-clipboard-text="shareDetail.key"
                      @click="message.success('已复制到剪贴板')">
              复制
            </a-button>
          </div>
        </a-descriptions-item>
      </a-descriptions>
      <template #footer></template>
    </a-modal>
  </a-layout-content>
</template>

<script setup>
import arRequest from '/src/script/auto-refresh-request.js'
import {message} from "ant-design-vue";
import {ref} from "vue";
import dayjs from "dayjs";
import {renderSize} from "../script/render-size.js";
import ClipboardJS from "clipboard";

const tableHeight = document.body.clientHeight - 300

const columns = [
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
    width: '35%'
  },
  {
    title: '过期时间',
    dataIndex: 'expire',
    key: 'expire',
    width: '20%'
  },
  {
    title: '操作',
    key: 'action',
    width: '15%'
  }
];
const shares = ref([])

loadShares()

function loadShares() {
  arRequest('/api/file/share', {
    method: 'GET'
  }).then(res => {
    if (res.code === 0) {
      return res.data
    } else {
      throw new Error()
    }
  }).then(data => {
    shares.value = data.map(e => ({
      code: e.code,
      name: e.name,
      isFile: e.isFile,
      expire: dayjs(e.expire).format('YYYY/MM/DD HH:mm:ss'),
      directoryPath: e.directoryPath
    }))

  })
}

new ClipboardJS('.copy')
const detailModalState = ref(false)
const emptyDetail = {
  code: '',
  key: '',
  name: '',
  isFile: '',
  expire: '',
  directoryPath: '',
  size: ''
}
const shareDetail = ref(emptyDetail)
function showDetailModal(code) {
  detailModalState.value = true
  arRequest(`/api/file/share/${code}/detail`, {
    method: 'GET'
  }).then(res => {
    console.log(res)
    if (res.code === 0) {
      return res.data
    } else {
      throw new Error()
    }
  }).then(share => {
    console.log(share)
    shareDetail.value = {
      code: share.code,
      key: share.key,
      name: share.name,
      isFile: share.isFile,
      expire: dayjs(share.expire).format('YYYY/MM/DD HH:mm:ss'),
      directoryPath: `/${share.directoryPath}`,
      size: renderSize(share.size)
    }
  }).catch(() => {
    loadShares()
  })
}

function clearDetail() {
  shareDetail.value = emptyDetail
}


function deleteShare(code){
  arRequest(`/api/file/share/${code}`, {
    method: 'DELETE'
  }).then(res => {
    if (res.code === 0) {
      message.success('删除分享成功')
      loadShares()
    } else {
      throw new Error()
    }
  })
}
</script>

<style scoped>
.copy-field {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}
</style>