<template>
  <view v-if="isShow">
    <view class="tip-wrap">
      <view class="left-wrap">
        <view class="tip-icon"></view>
        <span class="tip-text">
          请勿轻信任何关于汇款、中奖等信息，务必提高警惕，谨慎对待来自陌生号码的电话。如遇可疑情况，请及时向相关部门反馈并采取必要的防范措施。
          <span class="report-btn" @tap="report">点我举报</span>
        </span>
      </view>
      <view class="close-btn" @tap="hide"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
const isShow = ref(true);

const hide = () => {
  isShow.value = false;
};

const report = () => {
  setTimeout(() => {
    uni.showToast({
      title: "举报成功",
      icon: "success"
    });
  }, 500);
};
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
