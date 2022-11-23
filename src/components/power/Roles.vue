<template>
  <div class="roles-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-button type="primary" @click="rolesDialogVisible = true">添加角色</el-button>
      <!-- 表格区域 -->
      <el-table
        :data="rolesData"
        style="width: 100%"
        border
        stripe
        >
        <!-- 展开 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 展开行--- 渲染一级权限 -->
            <el-row v-for="(item1,id1) in scope.row.children" :key="item1.id" :class="['bd-bottom',id1 === 0 ? 'bd-top':'','centerflex']">
              <el-col :span="5">
                <el-tag closable  @close="removeRolesById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row v-for="(item2,id2) in item1.children" :key="item2.id" :class="[id2 === 0 ? '':'bd-top','centerflex']">
                  <el-col :span="6">
                    <el-tag type="success" closable  @close="removeRolesById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag type="warning" closable v-for="(item3) in item2.children" :key="item3.id" @close="removeRolesById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column  label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogRoles(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="subDialogRoles(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="请输入要添加角色的信息"
      :visible.sync="rolesDialogVisible"
      width="50%"
      :before-close="rolesHandleClose"
      @close="closedRolesDialog"
      >
      <!-- 填写表单 -->
      <el-form ref="rolesForm" :model="addRolesInfo" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="addRolesInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRolesInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postDialogRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="请输入要添加角色的信息"
      :visible.sync="editDialogVisible"
      width="50%"
      :before-close="editRolesHandleClose"
      @close="editClosedRolesDialog"
      >
      <!-- 填写表单 -->
      <el-form ref="editRolesForm" :model="getIdRolesInfo" label-width="80px">
        <el-form-item label="角色Id">
          <el-input :value="getIdRolesInfo.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item  label="角色名称">
          <el-input v-model="getIdRolesInfo.roleName" :value="getIdRolesInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item  label="角色描述">
          <el-input v-model="getIdRolesInfo.roleDesc" :value="getIdRolesInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 确认取消按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="putDialogRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 权限对话框 -->
    <el-dialog
      title="请选择要添加的权限"
      :visible.sync="rightDialogVisible"
      width="50%"
      @close="closedRightsDialog"
      >
      <el-tree
      :data="rightList"
      :props="rightProps"
      show-checkbox
      node-key="id"
      default-expand-all
      :default-checked-keys="defKeysTree"
      ref="elTreeRights"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postAllSeletRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyRoles',
  data() {
    return {
      // 角色数据
      rolesData: [],
      // 添加角色弹出款开关
      rolesDialogVisible: false,
      // 添加角色信息
      addRolesInfo: {
        // 角色名称
        roleName: '',
        // 角色介绍
        roleDesc: ''
      },
      // 编辑对话框开关
      editDialogVisible: false,
      // 根据id获得角色信息,编辑提交
      getIdRolesInfo: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      // 权限对话框开关
      rightDialogVisible: false,
      // 权限数据
      rightList: [],
      // 权限树状展示的数据
      rightProps: {
        label: 'authName',
        children: 'children'
      },
      // 展开时自动勾选已经有的权限
      defKeysTree: [],
      // 当前选中角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色数据
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      console.log(res)
      if (res.meta.status !== 200) return this.$message('获取角色数据失败')
      this.rolesData = res.data
    },
    // 提交对话框数据
    async postDialogRoles() {
      this.rolesDialogVisible = false
      const { data: res } = await this.$http.post('/roles', this.addRolesInfo)
      console.log(res)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
    },
    // 关闭对话框(叉叉)
    rolesHandleClose() {
      this.rolesDialogVisible = false
      this.$message('已取消添加角色')
    },
    // 关闭后对话框
    closedRolesDialog() {
      this.$refs.rolesForm.resetFields()
    },
    // 编辑角色,根据id查信息
    async editDialogRoles(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('/roles/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.$message(res.meta.msg)
      this.getIdRolesInfo.roleId = res.data.roleId
      this.getIdRolesInfo.roleName = res.data.roleName
      this.getIdRolesInfo.roleDesc = res.data.roleDesc
    },
    // 提交编辑信息
    async putDialogRoles() {
      this.editDialogVisible = false
      const { data: res } = await this.$http.put('/roles/' + this.getIdRolesInfo.roleId, {
        roleName: this.getIdRolesInfo.roleName,
        roleDesc: this.getIdRolesInfo.roleDesc
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.getRolesList()
      this.$message.success('编辑成功!')
    },
    // 取消角色编辑
    editRolesHandleClose() {
      this.editDialogVisible = false
      this.$message('已取消角色编辑')
    },
    // 关闭编辑清空数据
    editClosedRolesDialog() {
      this.$refs.editRolesForm.resetFields()
    },
    // 删除选中的数据
    async subDialogRoles(id) {
      const result = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'cancel') return this.$message('已取消删除')
      const { data: res } = await this.$http.delete('/roles/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRolesList()
    },
    // 删除权限中的标签
    async removeRolesById(role, rightsId) {
      console.log(role.id, rightsId)
      const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message('已取消删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightsId}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      this.$message.success(res.meta.msg)
      // this.getRolesList()
      // 这里不建议重新渲染数据因为这样roles页面就会重新渲染
      // 但是我们想要它停在展开页让用户看到删除效果
      role.children = res.data
    },
    // 展示权限对话框
    async showRightDialog(role) {
      // 将当前角色id保存，方便后续提交权限
      this.roleId = role.id
      // 发起请求拿到树状结构数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
      this.rightList = res.data
      console.log(role)
      // 进行递归选中已有权限
      this.getLeafKeys(role, this.defKeysTree)
      console.log(this.defKeysTree)
      this.rightDialogVisible = true
    },
    // 关闭权限对话框时，清空defKeysTree,防止点击其他角色时选择前面角色已有的权限
    closedRightsDialog() {
      this.defKeysTree = []
    },
    // 将已经有的权限通过递归传递给defKeysTree，让节点展开的时候被选中
    getLeafKeys(node, arr) {
      // 判断是否为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 不是三级节点，则循环递归
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 将选中的权限提交给后台
    async postAllSeletRights() {
      // 通过tree提供的方法获得全选节点和半选节点的id
      const allSctNode = [
        ...this.$refs.elTreeRights.getCheckedKeys(),
        ...this.$refs.elTreeRights.getHalfCheckedKeys()
      ]
      // 拼接字符串
      const strId = allSctNode.join(',')
      // 发起post请求给任务添加权限
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: strId })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('添加权限失败')
      this.$message.success('添加权限成功')
      this.getRolesList()
      this.rightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
 .el-card {
  margin-top: 15px;
 }
 .el-button {
  margin-bottom: 10px;
 }
 .el-tag {
  margin: 15px;
 }
 .bd-top {
  border-top: 1px solid #ccc;
 }
 .bd-bottom {
  border-bottom: 1px solid #ccc;
 }
 .centerflex {
  display: flex;
  align-items: center;
 }
</style>
