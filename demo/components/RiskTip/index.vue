<template>
  <view v-if="isShow">
    <view class="tip-wrap">
      <view class="tip-icon"></view>
      <span class="tip-text">
        请勿轻信任何关于汇款、中奖等信息，务必提高警惕，谨慎对待来自陌生号码的电话。如遇可疑情况，请及时向相关部门反馈并采取必要的防范措施。
      </span>
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
</script>
<style lang="scss" scoped>
@import url("./style.scss");
</style>
