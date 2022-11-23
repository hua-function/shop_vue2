<template>
  <div class="user-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryObj.query" clearable @clear="getUsersList()">
              <el-button slot="append" icon="el-icon-search"  @click="getUsersList()"></el-button>
            </el-input>
          </el-col>
          <el-col :span="1">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
      </el-row>
      <!-- 用户表格数据区域 -->
      <el-table
        :data="usersList"
        style="width: 100%"
        border
        stripe
        >
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="address" label="状态">
          <!-- 这里需要通过作用插槽拿到状态的数据mg_state -->
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="usersStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作" width="180">
          <!-- 作用域插槽渲染用户想要的效果 -->
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="subUsersList(scope.row.id)"></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="info" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryObj.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryObj.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        ref="pConfig"
        >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      :before-close="closeUsersList"
      @close="addDialogClosed"
      @keyup.enter="addDialogPost"
      >
      <!-- 表单验证 -->
      <el-form :model="addForm" :rules="addFormRules" label-width="100px" ref="addForm" @keyup.enter.native="addDialogPost">
        <!-- 用户名验证 -->
        <el-form-item v-model="addForm.username" label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <!-- 密码验证 -->
        <el-form-item v-model="addForm.password" label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <!-- 邮箱验证 -->
        <el-form-item v-model="addForm.email" label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <!-- 手机号验证 -->
        <el-form-item v-model="addForm.mobile" label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogPost">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="填写想要修改的信息"
      :visible.sync="showDialogVisible"
      width="50%"
      :before-close="closeEditDialog"
      @close="EditDialogClosed"
      @keyup.enter.native="editDialogData"
      >
      <!-- 修改用户表单验证 -->
      <el-form :model="editForm" :rules="addFormRules" label-width="100px" ref="editForm">
        <!-- 用户名ID -->
        <el-form-item  v-model="editForm.id" label="用户名ID" >
          <el-input :value="editForm.id" disabled></el-input>
        </el-form-item>
        <!-- 邮箱更改 -->
        <el-form-item v-model="editForm.email" label="邮箱" prop="email">
          <el-input v-model="editForm.email" :value="editForm.email"></el-input>
        </el-form-item>
        <!-- 手机号更改 -->
        <el-form-item v-model="editForm.mobile" label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile" :value="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogData">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 设置角色对话框 -->
    <el-dialog
      title="设置角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
      >
      <p>当前的用户:{{username}}</p>
      <p>当前用户角色:{{role}}</p>
      <el-select v-model="selRoleId" placeholder="请选择">
        <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyUsers',
  data() {
    // 定义邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      var regEmail = /^([A-Za-z0-9_-])+@([A-Za-z0-9_-])+(.[A-Za-z]{2,4})/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }

    // 定义电话号码验证规则
    var checkMobile = (rule, value, callback) => {
      var regMobile = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法电话号码'))
    }
    return {
      // 发起请求时需要传递的参数
      queryObj: {
        // 搜索信息
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 2
      },
      // 用户数据
      usersList: [],
      // 当前页总共条数
      total: 0,
      // 是否显示弹出框
      addDialogVisible: false,
      // 添加用户数据的对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户时规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改信息弹出框开关
      showDialogVisible: false,
      // 需要修改的数据
      editForm: {
        id: 0,
        email: '',
        mobile: ''
      },
      // 设置角色弹出框开关
      setRoleDialogVisible: false,
      // 当前用户名
      username: '',
      // 当前的角色
      role: '',
      // 当前的用户Id
      userId: '',
      // 返回的角色列表
      rolesList: [],
      // 选择的角色
      selRoleId: ''
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    // 获取用户列表数据
    async getUsersList() {
      const { data: res } = await this.$http.get('/users', { params: this.queryObj })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      console.log(res)
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 每页显示数改变
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryObj.pagesize = newSize
      this.getUsersList()
    },
    // 页码改变触发
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryObj.pagenum = newPage
      this.getUsersList()
    },
    // switch状态改变，将改变后的状态传给数据库
    async usersStateChange(newUsersState) {
      const { data: res } = await this.$http.put('users/' + newUsersState.id + '/state/' + newUsersState.mg_state)
      if (res.meta.status !== 200) {
        // 则状态改变会原来的状态
        newUsersState.mg_state = !newUsersState.my_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      console.log(res)
    },
    // 关闭添加用户弹出框信息
    closeUsersList() {
      this.addDialogVisible = false
      this.$message('已取消添加用户')
    },
    // 关闭对话框时，清空数据和校验
    addDialogClosed() {
      // 清空数据并清空校验
      this.$refs.addForm.resetFields()
    },
    // 提交时进行预验证
    addDialogPost() {
      // 进行表单预验证
      this.$refs.addForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入准确信息')
        // 发起axios请求，添加用户
        const { data: res } = await this.$http.post('/users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.addDialogVisible = false
        this.getUsersList()
        this.$message.success('用户添加成功')
      })
    },
    // 查询要修改的数据
    async showEditDialog(editData) {
      this.showDialogVisible = true
      this.editForm.id = editData.id
      // 发起get请求，拿到编辑的数据
      const { data: res } = await this.$http.get(`users/${this.editForm.id}`)
      // 判断是否获取到相应数据
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message('您可以开始修改相关数据了')
      this.editForm.email = res.data.email
      this.editForm.mobile = res.data.mobile
    },
    // 修改数据
    async editDialogData() {
      // 获取成功后进行更改
      // 进行表单预验证
      this.$refs.editForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入准确信息')
        // 发起axios请求，修改用户信息
        const { data: resPut } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (resPut.meta.status !== 200) return this.$message.error(this.meta.msg)
        this.showDialogVisible = false
        this.getUsersList()
        this.$message.success(resPut.meta.msg)
      })
    },
    // 关闭修改框之前提示
    closeEditDialog() {
      this.showDialogVisible = false
      this.$message('已取消编辑')
    },
    // 关闭后清空数据
    EditDialogClosed() {
      this.$refs.editForm.resetFields()
    },
    // 删除用户
    async subUsersList(subId) {
      const result = await this.$confirm('此操作将永久删除该信息，是否删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'cancel') return this.$message('已取消删除')
      const { data: res } = await this.$http.delete('users/' + subId)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      // 解决当前页最后一条数据删除后没有跳转到前一页
      // 得到向上取整的总页数,用当前页与剩余总页数做比较，得到需要加载的页
      let totalPage = Math.ceil((this.total - 1) / this.queryObj.pagesize)
      let pageNum = this.queryObj.pagenum > totalPage ? totalPage : this.queryObj.pagenum
      this.queryObj.pagenum = pageNum > 1 ? pageNum : 1
      this.getUsersList()
    },
    // 设置角色对话框，获取角色列表
    async setRole(role) {
      console.log(role)
      this.username = role.username
      this.role = role.role_name
      this.userId = role.id
      // 获取角色列表
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.rolesList = res.data
      console.log(this.rolesList)
      this.setRoleDialogVisible = true
    },
    // 设置角色
    async saveRoleInfo() {
      if (!this.selRoleId) return this.$message.error('角色不能为空')
      // 发起put请求
      const { data: res } = await this.$http.put(`users/${this.userId}/role`, { rid: this.selRoleId })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('设置角色失败')
      this.$message.success('设置角色成功')
      this.getUsersList()
      this.setRoleDialogVisible = false
    },
    // 监听对话框关闭
    setRoleDialogClosed() {
      console.log(this.selRoleId)
      this.selRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 10px;
  }
  .el-table {
    margin-top: 15px;
  }
  .el-pagination {
    margin-top: 15px;
  }
</style>
