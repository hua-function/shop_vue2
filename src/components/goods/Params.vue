<template>
  <div class="params-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示警告框 -->
      <el-alert title="注意：只允许用第三级分类设置相关参数" type="warning"></el-alert>
      <!-- select搜索框 -->
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="cateValue"
            :options="cateList"
            :props="cateProps"
            @change="cateHandleChange"
            clearable
            >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 表格 -->
          <el-table :data="manyParamsData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" >
              <!-- 渲染tab -->
              <template v-slot="scope">
                <el-tag closable v-for="(item,id) in scope.row.attr_vals" :key="id" @close="handleClosed(id,scope.row)">{{item}}</el-tag>
                <!-- 动态添加tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  style="width: 200px"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引行 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <!-- 按钮 -->
                <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger" class="el-icon-delete" size="mini" @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 表格 -->
          <el-table :data="onlyParamsData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- 渲染tab -->
              <template v-slot="scope">
                <el-tag closable v-for="(item,id) in scope.row.attr_vals" :key="id" @close="handleClosed(id,scope.row)">{{item}}</el-tag>
                <!-- 动态添加tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  style="width: 200px"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引行 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <!-- 按钮 -->
                <el-button type="primary" class="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger" class="el-icon-delete" size="mini"  @click="deleteParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加属性参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
      >
      <!-- 提交表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="110px">
        <el-form-item :label="titleText+ ':'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="'编辑'+ titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
      >
      <!-- 提交表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="110px">
        <el-form-item :label="titleText+ ':'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyParams',
  data() {
    return {
      // 获取所有商品列表
      cateList: [],
      // 绑定的值
      cateValue: [],
      // props规则
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 标签页绑定数据
      activeName: 'many',
      // 动态参数
      manyParamsData: [],
      // 静态参数
      onlyParamsData: [],
      // 添加属性对话框开关
      addDialogVisible: false,
      // 需要提交的表单数据
      addForm: {
        atrr_id: '',
        attr_name: ''
      },
      // 验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      },
      // 修改对话框开关
      editDialogVisible: false,
      // 提交修改表单数据
      editForm: {
        attr_name: ''
      },
      // 验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getcateList()
  },
  methods: {
    // 获取商品列表
    async getcateList() {
      const { data: res } = await this.$http.get('/categories', { params: { type: 3 } })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 选中发生改变时触发
    cateHandleChange() {
      this.getParamsList()
    },
    // 标签页点击触发
    handleTabClick() {
      this.getParamsList()
    },
    // 获取参数列表单独定义一个函数
    async getParamsList() {
      // 判断是否选中三级标题
      if (this.cateValue.length !== 3) {
        this.cateValue = []
        this.manyParamsData = []
        this.onlyParamsData = []
        return
      }
      // 发起请求获取参数列表
      const { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      // 将得到的attr_vals转换成数组(渲染展开tab需要用到)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 给渲染的每行tab添加开关和绑定属性
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res)
      // 判断是动态参数还是静态属性
      if (this.activeName === 'many') {
        this.manyParamsData = res.data
      } else {
        this.onlyParamsData = res.data
      }
      console.log('你的', this.manyParamsData)
    },
    // 关闭对话框清空表单和验证规则
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 提交表单数据
    async addParamsBtn() {
      console.log(this.getCateId, this.addForm.attr_name)
      const { data: res } = await this.$http.post(`categories/${this.getCateId}/attributes`, {
        attr_name: this.addForm.attr_name,
        attr_sel: this.activeName
      })
      if (res.meta.status !== 201) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      this.getParamsList()
      this.addDialogVisible = false
    },
    // 编辑功能
    async showEditDialog(params) {
      this.editForm.atrr_id = params.attr_id
      console.log(params.attr_id, this.getCateId)
      const { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes/${params.attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.editForm.attr_name = res.data.attr_name
      this.editDialogVisible = true
    },
    // 关闭编辑对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 确认提交
    async editParamsBtn() {
      const { data: res } = await this.$http.put(`categories/${this.getCateId}/attributes/${this.editForm.atrr_id}`, {
        attr_name: this.editForm.attr_name,
        attr_sel: this.activeName
      })
      if (res.meta.status !== 200) return this.$message.error('编辑失败')
      this.$message.success('编辑成功')
      this.getParamsList()
      this.editDialogVisible = false
    },
    // 删除
    async deleteParams(params) {
      // 弹出确认框
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message('以取消删除')
      const { data: res } = await this.$http.delete(`categories/${this.getCateId}/attributes/${params.attr_id}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败')

      this.$message.success('删除成功')
      this.getParamsList()
    },
    // 失去焦点
    async handleInputConfirm(row) {
      // 判断输入内容是否为空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.inputVisible = false
      // 添加tag到需要渲染的数据源中
      row.attr_vals.push(row.inputValue.trim())
      console.log(row.attr_vals.join(','))
      this.modifyTag(row)
    },
    // 点击展示input
    showInput(row) {
      row.inputVisible = true
      // 动态获取焦点
      /*
        因为这里用到的是原生Input标签的方法，只有当input
        渲染出来的时候才能拿到input，而$nextTick就是等到
        元素渲染完毕后在执行里面的内容。
      */
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag
    handleClosed(i, row) {
      // 根据索引删除对应数组的元素
      row.attr_vals.splice(i, 1)
      this.modifyTag(row)
    },
    // 对tag进行添加或删除发起的请求
    async modifyTag(row) {
      // 发起请求将数据添加到数据库
      const { data: res } = await this.$http.put(`categories/${this.getCateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('添加tag失败')
      this.$message.success('添加成功')
      // 清空
      row.inputValue = ''
      this.getParamsList()
    }
  },
  computed: {
    // 根据是否选中三级分类决定按钮是否被禁用
    isBtnDisabled() {
      if (this.cateValue.length === 3) {
        return false
      }
      return true
    },
    // 判断获取三级分类的id
    getCateId() {
      if (this.cateValue.length === 3) {
        return this.cateValue[2]
      }
      return null
    },
    // 根据动态还是静态决定显示框内容
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
  .el-col {
    margin-top: 10px;
  }
  .el-cascader {
    margin-left: 3px;
  }
  .el-tag {
    margin: 0 5px;
  }
  .el-button {
    margin-bottom: 10px;
  }
</style>
