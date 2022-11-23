<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets//heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="subLogin">返回</el-button>
    </el-header>

    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠效果 -->
        <div class="trigger-button" @click="triggerCollapse">|||</div>
        <el-menu
        background-color="#313743"
        text-color="#fff"
        active-text-color="rgb(64,160,254)"
        unique-opened
        :collapse="isCollapse"
        :collapse-transition="false"
        :router="true"
        :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menusList" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
            :index="itemChildren.path"
            v-for="itemChildren in item.children"
            :key="itemChildren.id"
            @click="activeClick(itemChildren.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{itemChildren.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'MyHome',
  data() {
    return {
      // 获取menus信息
      menusList: [],
      // 字体图标对象
      iconObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-3702mima',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-tijikongjian'
      },
      // 是否折叠
      isCollapse: false,
      // 解决高亮不显示问题，保存地址的值
      activePath: ''
    }
  },
  created () {
    this.getMenusList()
    // 将高亮激活路径绑定到data中,是为了返回的时候还保持高亮状态
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 返回login
    subLogin() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 发起axios请求获取menus数据
    async getMenusList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menusList = res.data
    },
    // 点击折叠
    triggerCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 高亮点击
    activeClick(activePath) {
      // 将高亮的地址保存到sessionStorage中
      window.sessionStorage.setItem('activePath', activePath)
      // 将保存的高亮地址赋值给activePath
      this.activePath = window.sessionStorage.getItem('activePath')
    }
  }
}
</script>

<style lang="less" scoped>
 .el-header {
  background-color: rgb(54,61,64);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  > div {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 20px;
    span {
      margin-left: 15px;
    }
  }
 }
 .el-aside {
  background-color: rgb(49,55,67);
  .trigger-button {
    width: 100%;
    height: 20px;
    background-color: rgb(71,81,99);
    color: #fff;
    font-size: 12px;
    text-align: center;
    line-height: 18px;
    letter-spacing: 0.3em;
    cursor: pointer;
  }
  .el-menu {
    border: none;
  }
 }
 .el-main {
  background-color: rgb(233,237,241);
 }
 .home-container {
  height: 100%;
 }
 .iconfont {
  margin-right: 10px;
 }
</style>
