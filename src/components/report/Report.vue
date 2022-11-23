<template>
  <div class="report-container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <!-- 2.为 ECharts 准备一个定义了宽高的 DOM -->
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 1.导入echarts视图
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'MyReport',
  data() {
    return {
      // 渲染图表的数据
      option: {
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        legend: {
          data: ['销量']
        },
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      }
    }
  },
  created() {},
  // 在dom渲染完成后呈现图表
  async mounted() {
    // 3.基于准备好的dom，初始化echarts实例
    let myChart = echarts.init(document.getElementById('main'))
    const { data: res } = await this.$http.get('reports/type/1')
    console.log(res)
    if (res.meta.status !== 200) return this.$message.error('获取失败')
    // 4.指定图表的配置项和数据
    /*
      这里最好是将获得的数据与原来的数据进行合并，是效果统一。
    */
    const result = _.merge(this.option, res.data)
    // 5.使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
  .el-card {
    margin-top: 15px;
  }
</style>
