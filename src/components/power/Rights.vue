><template>
  <div class="rights-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 表格区域 -->
      <el-table
        :data="rightsData"
        style="width: 100%"
        border
        stripe
        >
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MyRights',
  data() {
    return {
      // 权限数据
      rightsData: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取权限表格数据
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/' + 'list')
      console.log(res)
      if (res.meta.status !== 200) return this.$message('获取信息失败，请重新获取!')
      this.rightsData = res.data
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
</style>
