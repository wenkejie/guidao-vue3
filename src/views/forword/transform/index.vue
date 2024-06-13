<template>
  <div class="app-container">
    <el-tabs type="border-card">
      <el-tab-pane label="我的传阅">
        <el-form :model="queryParams" label-position="left" ref="queryForm" v-show="showSearch" @submit.prevent>
          <el-row :gutter="30">
            <el-col :span="16">
              <el-form-item label="" prop="fileId">
                <el-input v-model="queryParams.fileId" placeholder="请输入文件id" clearable />
              </el-form-item>
              <div v-if="updateSearch">
                <el-form-item label="" style="width: 500px;">
                  <el-date-picker v-model="dateRangeAddTime" type="daterange" range-separator="-"
                    start-placeholder="开始日期" end-placeholder="结束日期" placeholder="请选择上传时间"></el-date-picker>
                </el-form-item>
                <el-form-item label="" prop="storeType">
                  <el-radio-group v-model="queryParams.storeType" @change="handleQuery" placeholder="请选择存储类型">
                    <el-radio-button value=""> 全部 </el-radio-button>
                    <el-radio-button v-for="item in storeTypeOptions" :key="item.dictValue" :value="item.dictValue">
                      {{ item.dictLabel }}
                    </el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="8" style="text-align: right;">
              <el-form-item>
                <el-button type="primary" icon="search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
                <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
                <el-button icon="refresh" @click="updateSearch = !updateSearch">高级搜索</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <!-- 工具区域 -->
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="upload" @click="handleAdd">
              {{ $t('btn.upload') }}
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" :disabled="multiple" plain icon="delete" @click="handleDelete">
              {{ $t('btn.delete') }}
            </el-button>
          </el-col>
          <right-toolbar :showSearch="showSearch" @queryTable="getAllList"> </right-toolbar>
        </el-row>

        <!-- 数据区域 -->
        <el-table :data="dataList" v-loading="loading" ref="table" border highlight-current-row
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <!-- <el-table-column prop="id" label="文件id" width="150" :show-overflow-tooltip="true" /> -->
          <el-table-column prop="name" label="文件名" align="left" :show-overflow-tooltip="true">
            <template #default="scope">
              <el-icon v-if="!scope.row.extension" :size="26">
                <Folder color="#ff9800" />
              </el-icon>
              <el-icon v-else size="26">
                <Picture color="#67C23A" />
              </el-icon>
              <a href="javascript:" @click="handleView(scope.row)">{{ scope.row.name }}</a>
              <!-- <el-link type="primary" :href="scope.row.accessUrl" target="_blank">{{ scope.row.name }}</el-link> -->
            </template>
          </el-table-column>
          <el-table-column prop="size" label="文件大小" align="center" :show-overflow-tooltip="true" width="100px" />
          <el-table-column prop="extension" label="扩展名" align="center" :show-overflow-tooltip="true" width="80px" />

          <el-table-column prop="create_by" label="操作人" align="center" width="80px" />
          <el-table-column prop="modifiedDate" label="操作时间" align="center" width="120">
            <template #default="{ row }">
              {{ showTime(row.modifiedDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="180">
            <template #default="scope">
              <el-button-group size="small">
                <el-button type="primary" @click="handleView(scope.row)">
                  查看
                </el-button>
                <el-button type="success" @click="handelTransform(scope.row)">
                  传阅
                </el-button>
                <el-button type="warning" @click="handleDelete(scope.row)">
                  删除
                </el-button>
              </el-button-group>

            </template>
          </el-table-column>
        </el-table>
        <pagination background :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
          @pagination="getAllList" />
      </el-tab-pane>
      <el-tab-pane label="传阅管理">传阅管理</el-tab-pane>
    </el-tabs>

    <el-dialog :title="title" :lock-scroll="false" v-model="open" width="500px" draggable>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-position="left">
        <el-row>
          <el-col :lg="24">
            <DocumentUpload ref="uploadRef" @call-back="handleClosed" v-model="form.accessUrl" :fileType="[]"
              :fileSize="100" :drag="true" :data="uploadData" :autoUpload="false" @success="handleUploadSuccess" />
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
          <el-button type="primary" @click="submitUpload">{{ $t('btn.submit') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :lock-scroll="false" v-model="openFileView" title="文件预览" :width="850">
      <iframe :src="viewUrl" frameborder="no" style="width: 100%;height: 600px" scrolling="auto" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openFileView = false">取消</el-button>
          <el-button type="primary" @click="openFileView = false">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :lock-scroll="false" v-model="openFolderView" :title="optionType == 'copy' ? '文件复制' : '文件移动'"
      :width="650">
      <el-form-item :label="optionType == 'copy' ? '复制到' : '移动到'">
        <el-select v-model="selectFolder" placeholder="Select" size="large" style="width: 240px">
          <el-option v-for=" item  in  folderSelectOptions " :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openFolderView = false">取消</el-button>
          <el-button type="primary" @click="handelFolderViewConfirm()">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :lock-scroll="false" v-model="openView" title="文件传阅" :width="650">
      <el-form :model="formData">
        <el-form-item label="部门选择">
          <el-select v-model="groupData" multiple collapse-tags placeholder="Select" @change="getUsersList()"
            style="width: 320px">
            <el-option v-for="    item     in     treeGroupData    " :key="item.id" :label="item.shortName"
              :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="接传人员">
          <el-select v-model="selectUsers" placeholder="Select" style="width: 320px" multiple collapse-tags>
            <el-option v-for="item in personOptions" :key="item.userName" :label="item.firstName" :value="item.id">
              <span style="float: left">{{ item.firstName }}</span>
              <span style="
                  float: right;
                  color: var(--el-text-color-secondary);
                  font-size: 13px;
                ">
                {{ item.departmentName }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="传阅期限">
          <el-date-picker v-model="selctDates" type="daterange" :default-time="defaultTime" range-separator="-"
            start-placeholder="开始日期" end-placeholder="结束日期" placeholder="请选择上传时间"></el-date-picker>

        </el-form-item>
        <el-row :gutter="10" style="width: 300px;">
          <el-col :span="12">
            <el-form-item label="到期推送">
              <el-switch v-model="formData.isExpirePush" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期后不可查阅">
              <el-switch v-model="formData.isExpireUnableLook" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="传阅时长">
          <el-input v-model="formData.browseDuration" placeholder="请选择" style="width: 320px;">
            <template #append>
              秒
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="是否答题">
          <el-select v-model="formData.hasQuestions" placeholder="请选择">
            <el-option label="是" value="0" />
            <el-option label="否" value="1" />
          </el-select>
        </el-form-item>
        <div class="qs-grid" v-if="formData.hasQuestions == 0">
          <h3>问卷新增：<el-button @click="addQsItem()">添加题目</el-button></h3>
          <el-form :model="qsForm" label-width="70">
            <el-row :gutter="20" v-for="(item, i) in qsForm">
              <el-col :span="12">
                <el-form-item :label="'题目' + (i + 1)">
                  <el-input v-model="item.title" placeholder="请输入题目" />
                </el-form-item>
                <el-form-item label=" ">
                  <el-button @click="delQsItem(i)" type="danger">删除问题</el-button>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="'选项' + (j + 1)" v-for="(cell, j) in item.answers">
                  <el-input v-model="cell.description" placeholder="请输入题目" class="ans-input">
                    <template #append>
                      <a href="javascript:" class="ans-input-btn" @click="delAnsItem(i, j)">
                        <el-icon>
                          <Delete />
                        </el-icon>
                      </a>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label=" ">
                  <el-button @click="addAnsItem(i)">添加选项</el-button>
                </el-form-item>
              </el-col>
              <el-divider border-style="dashed" />
            </el-row>
          </el-form>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">取消</el-button>
          <el-button type="primary" @click="transformConform">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="files">
import { listSysfile, delSysfile, getSysfile, listFolder, getAllInfo } from '@/api/tool/file.js'
import { listUser, getDepartments, addCirculationDoc } from '@/api/system/user'
import { getDocumentToken, copyDocument, moveDocument } from '@/api/files/document.js'
import { defaultWindow, useClipboard } from '@vueuse/core'
import QRCode from 'qrcodejs2-fixes'
import { showTime } from '@/utils'
import { getToken } from '@/utils/auth';

import { ElMessage, ElMessageBox } from 'element-plus'

import Breadcrumb from '@/components/Breadcrumb'

import { fromByteArray } from 'base64-js';

// 根目录ID
const rootId = ref('a4d06132-d76c-49b5-8472-2bf78ac4147e')

// 选中id数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 遮罩层
const loading = ref(true)
// 显示搜索条件
const showSearch = ref(true)

//高级搜索
const updateSearch = ref(false)

//选择的时间区间
const selctDates = ref([])
const defaultTime = ref([
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
])

// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
const openView = ref(false)
const openFileView = ref(false)

const viewUrl = ref('')

// 问卷表单
const qsForm = ref([{
  title: '',
  answers: [
    {
      description: " ",
      isCorrect: true
    }
  ]
}])

function addQsItem() {
  let qsItem = {
    title: '',
    answers: [
      {
        description: " ",
        isCorrect: true
      }
    ]
  }
  let _list = qsForm.value
  _list.push(qsItem)
  qsForm.value = _list
}

function addAnsItem(index) {
  console.log(index, 'index')
  let _list = qsForm.value[index].answers
  _list.push({ value: '' })
  qsForm.value[index].answers = _list
  console.log(qsForm.value, 'qsForm[index].answers')
}

function delQsItem(i) {
  if (i > -1 && i < qsForm.value.length) {
    qsForm.value.splice(i, 1);
  }
}

function delAnsItem(i, j) {
  console.log(i, j, 'i,j')
  if (j > -1 && j < qsForm.value[i].ansList.length) {
    qsForm.value[i].ansList.splice(j, 1);
  }
}

function resetFormInfo() {
  qsForm.value = []
  selctDates.value = []
  formData.value = {}
}

function transformConform() {
  formData.value.questions = qsForm.value
  formData.value.startDate = selctDates.value[0].toISOString()
  formData.value.endDate = selctDates.value[1].toISOString()
  formData.value.users = selectUsers.value
  // console.log(JSON.stringify(formData.value), 'formData.value.toString()')
  ElMessageBox.confirm(
    '确认将此文件下发?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      addCirculationDoc(formData.value).then((res) => {
        if (res.statusCode == 200) {
          ElMessage({
            type: 'success',
            message: res.msg,
          })
          resetFormInfo()
        } else {
          ElMessage({
            type: 'error',
            message: res.msg,
          })
        }
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消',
      })
    })
}


// 表单
const formRef = ref(null)
const formView = ref({})
const uploadRef = ref(null)
// 上传时间时间范围
const dateRangeAddTime = ref([])
// 存储类型选项列表
const storeTypeOptions = ref([
  { dictLabel: 'pdf', dictValue: 1 },
  { dictLabel: 'word', dictValue: 2 },
  { dictLabel: 'pptx', dictValue: 3 },
  { dictLabel: 'jpg', dictValue: 4 },
  { dictLabel: 'png', dictValue: 5 },
  { dictLabel: 'bmp', dictValue: 6 }
])
//文件名产生选项列表
const fileNameTypeOptions = ref([
  { dictLabel: '原文件名', dictValue: 1 },
  { dictLabel: '自定义', dictValue: 2 },
  { dictLabel: '自动生成', dictValue: 3 }
])
// 存储目录前缀
const saveDirOptions = ref([
  { dictLabel: 'uploads', dictValue: 'uploads' },
  { dictLabel: 'video', dictValue: 'video' },
  { dictLabel: 'avatar', dictValue: 'avatar' }
])
// 数据列表
const dataList = ref([])
// 总记录数
const total = ref(0)

// 文件夹选择
const openFolderView = ref(false)
const selectFolder = ref('')
const selectDocument = ref('')
const optionType = ref('')
const folderSelectOptions = ref([])
function handelFolderViewConfirm() {
  if (optionType.value == 'copy') {
    copyDocument({ destinationFolderId: selectFolder.value, documentId: selectDocument.value }).then((res) => {
      openFolderView.value = false
      getAllList('a4d06132-d76c-49b5-8472-2bf78ac4147e')
      console.log(res, 'res')
    })
  } else if (optionType.value == 'move') {
    moveDocument({ destinationFolderId: selectFolder.value, documentId: selectDocument.value }).then((res) => {
      openFolderView.value = false
      getAllList('a4d06132-d76c-49b5-8472-2bf78ac4147e')
      console.log(res, 'res')
    })
  } else {
    getAllList('a4d06132-d76c-49b5-8472-2bf78ac4147e')
  }

}


const state = reactive({
  form: {
    storeType: 1
  },
  rules: {
    accessUrl: [
      {
        required: true,
        message: '上传文件不能为空',
        trigger: 'blur'
      }
    ],
    storeType: [
      {
        required: true,
        message: '存储类型不能为空',
        trigger: 'blur'
      }
    ],
    fileName: [
      {
        required: true,
        message: '文件名不能为空',
        trigger: 'blur'
      }
    ]
  },
  queryParams: {
    id: null,
    pageNum: 1,
    pageSize: 20,
    fileId: undefined
  }
})
const { queryParams, form, rules } = toRefs(state)
const { proxy } = getCurrentInstance()
const uploadData = ref()

const route = useRoute();
const router = useRouter();


//树形组件结构添加
const filterText = ref('')
const treeRef = ref(null)

const defaultProps = {
  children: 'children',
  label: 'shortName',
}

watch(filterText, (val) => {
  treeRef.value.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.shortName.includes(value)
}

const onQueryChanged = (query) => {
  // TODO: fix typing when refactor tree-v2
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  treeRef.value.filter(query)
}

const filterMethod = (query, node) => {
  if (!query) return true
  console.log(node, 'node.fullName')
  return node.shortName.includes(query)
}

const treeGroupData = ref([])

const groupData = ref([])
const personData = ref([])


const formData = ref({})

const getCheckedNodes = () => {
  console.log('hello')
}

const generateData = () => {
  const data = []
  for (let i = 1; i <= 15; i++) {
    data.push({
      key: i,
      label: `Option ${i}`,
      disabled: i % 4 === 0,
    })
  }
  return data
}

const transferData = ref(generateData())
const transferValue = ref([])


const personOptions = ref([])
const selectUsers = ref([])
const personOptions1 = ref([
  {
    "label": "财务部",
    "children": [
      {
        "name": "张三",
        "value": "7890"
      },
      {
        "name": "李四",
        "value": "4321"
      }
    ]
  },
  {
    "label": "人事部",
    "children": [
      {
        "name": "王五",
        "value": "1234"
      },
      {
        "name": "赵六",
        "value": "5678"
      }
    ]
  },
  {
    "label": "技术部",
    "children": [
      {
        "name": "张三",
        "value": "9012"
      },
      {
        "name": "李四",
        "value": "3456"
      }
    ]
  },
  {
    "label": "市场部",
    "children": [
      {
        "name": "王五",
        "value": "7890"
      },
      {
        "name": "赵六",
        "value": "1234"
      }
    ]
  }
])


// 查询数据
function getFileList() {
  let files = []
  let rootId = localStorage.getItem('rootId') ? localStorage.getItem('rootId') : 'a4d06132-d76c-49b5-8472-2bf78ac4147e'
  loading.value = true
  listSysfile('a4d06132-d76c-49b5-8472-2bf78ac4147e').then((res) => {
    if (res) {
      files = res
      total.value = res.length
      loading.value = false
      console.log(files, 'files')

      return files
    }

  })
}

// 查询文件夹数据
function getFolderList() {
  let folders = []
  let rootId = localStorage.getItem('rootId') ? localStorage.getItem('rootId') : 'a4d06132-d76c-49b5-8472-2bf78ac4147e'
  loading.value = true
  listFolder(rootId).then((res) => {
    if (res) {
      folders = res
      total.value = res.length
      loading.value = false
      console.log(folders, 'folders')
      return folders
    }
  })
}

async function getAllList(id) {
  loading.value = true
  let p1 = getAllInfo.getFolderList(id);
  let p2 = getAllInfo.getDocumentList(id);
  Promise.all([p1, p2]).then(function (values) {
    console.log(values);//values为一个数组
    dataList.value = [...values[0], ...values[1]]
    folderSelectOptions.value = values[0]
    console.log(dataList.value);
    loading.value = false
    ///进行你的下一步操作
  });
}


// 取消按钮
function cancel() {
  open.value = false
  reset()
}
// 重置数据表单
function reset() {
  form.value = {
    fileName: '',
    fileUrl: '',
    storePath: '',
    fileSize: 0,
    fileExt: '',
    storeType: 1,
    accessUrl: '',
    fileNameType: 3
  }
  proxy.resetForm('formRef')
}
/** 重置查询操作 */
function resetQuery() {
  // 上传时间时间范围
  dateRangeAddTime.value = []
  proxy.resetForm('queryForm')
  handleQuery()
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  getAllList(rootId.value)
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '上传文件'
  // form.value.storeType = queryParams.storeType
}
// 关闭上传窗口
function handleClosed(item) {
  open.value = false
  handleQuery()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？')
    .then(function () {
      return delSysfile(Ids)
    })
    .then(() => {
      handleQuery()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => { })
}
/** 查看按钮操作 */
function handleView(row) {
  viewUrl.value = ''
  if (!row.extension) {
    router.push('/forward/folder?id=' + row.id + '&physicalFolderId=' + row.physicalFolderId)
  } else {
    console.log(row.id, 'id')
    getDocumentToken(row.id).then((res) => {
      console.log(res, 'res')
      let fileToken = res.result

      const host = location.host;
      const protocol = location.protocol;
      const apiUrl = import.meta.env.VITE_APP_API_HOST;
      const url = apiUrl === '/' ? `${protocol}//${host}/` : apiUrl;
      // let originalString = `http://127.0.0.1:8887/api/document/${row.id}/download?token=${fileToken}&isVersion=true&fullfilename=${row.name}`;
      let newUrl = `${url}api/document/${row.id}/officeviewer?token=${fileToken}&isVersion=false&fullfilename=${row.name}`
      console.log(newUrl, 'newUrl')
      let byteArray = new TextEncoder().encode(newUrl); // 将字符串转换为字节数组
      console.log(byteArray, 'byteArray')
      var stringData = fromByteArray(byteArray);
      // let encodedString = window.btoa(stringData);
      // window.open('http://172.20.153.9:8012/onlinePreview?url=' + stringData)
      viewUrl.value = 'http://172.20.153.9:8012/onlinePreview?url=' + stringData
      openFileView.value = true
    })
  }

}

function handelTransform(row) {
  formData.value.documentId = row.id
  openView.value = true
}

function createQrCode(url) {
  document.getElementById('imgContainer').innerHTML = ''
  new QRCode(document.getElementById('imgContainer'), {
    text: url,
    width: 100,
    height: 100
  })
}
// 上传成功方法
function handleUploadSuccess(filelist) {
  open.value = false
  getAllList()
}
// 手动上传
// 手动上传
function submitUpload() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      var result = new Promise((resolve) => {
        uploadData.value = {
          fileDir: form.value.storePath,
          fileName: form.value.fileName,
          storeType: form.value.storeType,
          fileNameType: form.value.fileNameType,
          physicalFolderId: '79073ec1-51e2-4772-95e6-9b06075a174b'
        }
        resolve(true)
      })
      //使用异步解决第一次上次获取不到表单的值
      result.then(() => {
        proxy.$refs.uploadRef.submitUpload()
      })
    }
  })
}

async function handleDown(item) {
  await proxy.downFile(`/api/document/${item.id}/download`)
}

async function handelOptionDocument(val, type) {
  selectDocument.value = val
  optionType.value = type
  openFolderView.value = true
}

function getTreeselect() {
  getDepartments({ parentId: "13" }).then((response) => {
    treeGroupData.value = [{ id: 0, shortName: '未知部门', children: [] }, ...response]
    // console.log(deptOptions.value, 'dep')
  })
}

function getUsersList() {
  let query = groupData.value.join(',')
  // console.log(query, 'query')
  listUser({ departmentIds: query }).then((res) => {
    personOptions.value = res.data
    // console.log(personOptions.value, 'personOptions.value')
  })
}

getTreeselect()

handleQuery()
</script>
<style scoped>
.el-avatar {
  display: inline-block;
  text-align: center;
  background: #ccc;
  color: #fff;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  vertical-align: middle;
  width: 32px;
  height: 32px;
  line-height: 32px;
  border-radius: 16px;
}

.qrCode {
  border: 5px solid var(--el-color-primary);
}

.ans-input /deep/ .el-input-group__append {
  padding: 0 !important;
}

.ans-input-btn {
  display: block;
  padding: 0 10px;
}
</style>
