<template>
  <div class="list-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框 -->
      <el-input placeholder="请输入商品关键字"  v-model="listInfo.query" clearable @clear="getGoodsList" style="width:400px">
        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
      </el-input>
      <!-- 添加商品按钮 -->
      <el-button type="primary" @click="goAddGoods">添加商品</el-button>
      <!-- 表格 -->
      <el-table
        :data="goodsList"
        style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="550"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
        <el-table-column label="创建时间" prop="upd_time" width="170">
          <template v-slot="scope">
            <!-- 时间过滤器 -->
            {{scope.row.upd_time | dataFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot="scope">
            <el-button type="primary" class="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" class="el-icon-delete" size="mini" @click="removeGoods(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listInfo.pagenum"
        :page-sizes="[10, 50, 100, 200]"
        :page-size="listInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加商品对话框 -->
    <el-dialog
      title="添加商品"
      :visible.sync="goodsDialogVisible"
      width="50%"
      >
      <div>
        <el-form ref="addForm" :model="addForm" label-width="100px">
          <el-form-item label="商品名称：">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格：">
            <el-input v-model="addForm.goods_price"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="goodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MyList',
  data() {
    return {
      // 获取商品列表
      goodsList: [],
      // 得到数据传送参数
      listInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前显示条数
        pagesize: 10
      },
      // 总页数
      total: 0,
      // 添加商品对话框
      goodsDialogVisible: false,
      // 添加商品信息
      addForm: {
        // 商品名称
        goods_name: '',
        // 分类列表
        goods_cat: '',
        // 价格
        goods_price: null,
        // 数量
        goods_number: 0,
        // 重量
        goods_weight: 0,
        // 介绍
        goods_introduce: '',
        // 上传对象的临时路径
        pics: '',
        // 商品参数（数组）
        attrs: []
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.listInfo })
      if (res.meta.status !== 200) return this.$message.error('获取数据失败')
      console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 每页显示数发生变化
    handleSizeChange(pagesize) {
      this.listInfo.pagesize = pagesize
      this.getGoodsList()
    },
    // 页码发生变化
    handleCurrentChange(pagenum) {
      this.listInfo.pagenum = pagenum
      this.getGoodsList()
    },
    // 根据id搜索商品
    async selectGoods() {
      const { data: res } = await this.$http.get('goods/' + this.listInfo.query)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.goodsList = []
      this.goodsList[0] = res.data
      // 清空id
      this.listInfo.query = ''
    },
    // 添加商品
    goAddGoods() {
      console.log(this)
      // 跳转页面
      this.$router.push({ path: '/goods/add' })
    },
    // 提交添加商品信息
    addFormBtn() {
      console.log(this.addForm)
      this.goodsDialogVisible = false
    },
    // 删除商品
    async removeGoods(id) {
      const result = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message('已取消删除')
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      // 防止最后一页最后一条数据删除后不跳到上一页
      let totalPage = Math.ceil((this.total - 1) / this.listInfo.pagesize)
      this.listInfo.pagenum = this.listInfo.pagenum > totalPage ? totalPage : this.listInfo.pagenum
      this.listInfo.pagenum = this.listInfo.pagenum > 1 ? this.listInfo.pagenum : 1
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
  .el-button {
    margin-left: 10px;
  }
  .el-table {
    margin-top: 10px;
  }
  .el-pagination {
    margin-top: 10px;
  }
</style>
