<template>
  <view class="login-wrap">
    <view class="login-header">
      <text class="login-title">登录环信IM</text>
      <view class="version" @tap="times++">V1.0.0</view>
    </view>
    <!-- 用户名密码登录 -->
    <view v-if="isPasswordLogin" class="login-form-warp">
      <view class="input-wrap">
        <input
          class="input"
          v-model="userId"
          :placeholder="t('loginUserIdPlaceholder')"
        />
      </view>
      <view class="input-wrap">
        <input
          class="input"
          type="password"
          v-model="password"
          :placeholder="t('loginPasswordPlaceholder')"
        />
      </view>
    </view>
    <!-- 手机号验证码登录 -->
    <view v-else class="login-form-wrap">
      <view class="input-wrap">
        <input
          class="input"
          v-model="tel"
          type="number"
          maxlength="11"
          :placeholder="t('loginPhoneIdPlaceholder')"
        />
      </view>
      <div id="captcha-element"></div>
      <view class="input-wrap">
        <input
          class="input"
          v-model="code"
          type="number"
          maxlength="6"
          :placeholder="t('loginCodePlaceholder')"
        />
        <div @tap="verifyPhoneNum">
          <text
            size="mini"
            type="primary"
            class="get-code"
            id="captcha-button"
            :style="
              isPhoneNumberValid() && counter === 60
                ? 'pointer-events: auto'
                : 'pointer-events:none'
            "
          >
            {{ counter === 60 ? t("getCode") : counter }}
          </text>
        </div>
      </view>
    </view>
    <button class="login-btn" type="primary" @tap="loginIM">
      {{ t("login") }}
    </button>
    <view class="private-wrap">
      <checkbox-group @change="checkboxChange">
        <label class="label">
          <checkbox
            backgroundColor="#f9fafa"
            borderColor="#ACB4B9"
            activeBackgroundColor="#009DFF"
            activeBorderColor="#009DFF"
            style="transform: scale(0.8)"
            iconColor="#fff"
            value="true"
            :checked="privacyChecked"
          />
          {{ t("agreeTo") }}
          <a class="privacy" @tap="toPrivacy">《{{ t("privacyPolicy") }}》</a>
        </label>
      </checkbox-group>
    </view>
    <view
      v-if="times > 5 || IS_USE_CUSTOM_SERVER"
      class="server-config"
      @tap="toServerConfig"
    >
      {{ t("serverConfig") }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, onBeforeUnmount } from "vue";
import { t } from "../../const/locales";
import {
  CHAT_STORE,
  IS_USE_CUSTOM_SERVER,
  APP_SERVER_URL
} from "@/const/index";
import { encryptAES } from "./crypto";

// 基础数据
let disabled = false;
const counter = ref(60);
const timer = ref<number | null>(null);
const userId = ref("");
const password = ref("");
const tel = ref("");
const code = ref("");
const privacyChecked = ref(false);
const times = ref(0);

// 阿里云验证码
let captcha = null;
let captchaButton = null;

const secret = "";
const sceneId = "";
const prefix = "";
const isPasswordLogin = ref(!!IS_USE_CUSTOM_SERVER);

// 是否使用密码登录
// const isPasswordLogin = ref(false);

// 启动倒计时
const startCount = () => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  disabled = true;
  counter.value = 60;
  timer.value = setInterval(() => {
    counter.value--;
    if (counter.value <= 0) {
      clearInterval(timer.value as number);
      counter.value = 60;
      disabled = false;
      timer.value = null;
    }
  }, 1000);
};

const verifyPhoneNum = () => {
  if (!isPhoneNumberValid()) {
    uni.showToast({
      title: t("telNumberError"),
      icon: "none"
    });
  }
};

const isPhoneNumberValid = () => {
  return /^1[3456789]\d{9}$/.test(tel.value);
};

// 获取验证码
const getCode = async (captchaVerifyParam: string) => {
  if (disabled) {
    return;
  }
  if (!/^1[3456789]\d{9}$/.test(tel.value)) {
    uni.showToast({
      title: t("telNumberError"),
      icon: "none"
    });
    return;
  }

  try {
    const res: any = await uni.request({
      url: `${APP_SERVER_URL}/inside/app/sms/send/v2`,
      header: { "content-type": "application/json" },
      method: "POST",
      data: { phoneNumber: tel.value, captchaVerifyParam }
    });

    if (res.statusCode === 200) {
      startCount();
      uni.showToast({ title: t("getCodeSuccess"), icon: "none" });
      return true;
    } else if (res.statusCode === 400) {
      handleGetCodeError(res.data.errorInfo);
      return false;
    } else {
      uni.showToast({ title: t("getCodeFailed"), icon: "none" });
    }
  } catch (error) {
    uni.showToast({ title: t("getCodeFailed"), icon: "none" });
  }
};

// 处理验证码获取错误信息
const handleGetCodeError = (errorInfo: string) => {
  const messages: Record<string, string> = {
    "phone number illegal": t("telNumberError"),
    "Please wait a moment while trying to send.": t("getCodeFrequent"),
    "exceed the limit": t("getCodeReachLimit"),
    "This request has reached api limit.": t("getCodeReachLimit")
  };
  const message = messages[errorInfo] || errorInfo;
  uni.showToast({ title: message, icon: "none" });
};

// 登录逻辑（用户名密码登录）
const loginWithPassword = () => {
  uni.showLoading({
    title: t("loginLoadingTitle")
  });
  uni.$UIKit.chatStore
    .login({
      user: userId.value,
      pwd: password.value // 密码登录
      // accessToken: "" // token登录
    })
    .then((res) => {
      uni.setStorage({
        key: CHAT_STORE,
        data: {
          userId: userId.value,
          token: res.accessToken
        }
      });
      // 跳转会话列表页面
      uni.switchTab({
        url: "/ChatUIKit/modules/Conversation/index"
      });
    })
    .catch((e) => {
      uni.showToast({
        title: e?.data?.data?.error_description,
        icon: "none"
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};

// 登录逻辑（手机号验证码登录）
const loginWithTel = async () => {
  uni.showLoading({
    title: t("loginLoadingTitle")
  });
  try {
    const res: any = await uni.request({
      url: `${APP_SERVER_URL}/inside/app/user/login/V2`,
      header: {
        "content-type": "application/json"
      },
      method: "POST",
      data: {
        phoneNumber: tel.value,
        smsCode: code.value
      }
    });
    if (res.statusCode == 200) {
      const { token, chatUserName } = res.data;
      uni.$UIKit.chatStore
        .login({
          user: chatUserName,
          accessToken: token
        })
        .then((res) => {
          uni.setStorage({
            key: CHAT_STORE,
            data: {
              userId: chatUserName,
              token: res.accessToken
            }
          });
          // 跳转会话列表页面
          uni.switchTab({
            url: "/ChatUIKit/modules/Conversation/index"
          });
        })
        .finally(() => {
          uni.hideLoading();
        });
    } else if (res.statusCode == 400) {
      if (res.data.errorInfo) {
        switch (res.data.errorInfo) {
          case "UserId password error.":
            uni.showToast({
              title: t("userIdOrPasswordError"),
              icon: "none"
            });
            break;
          case "phone number illegal":
            uni.showToast({
              title: t("telNumberError"),
              icon: "none"
            });
            break;
          case "SMS verification code error.":
            uni.showToast({
              title: t("codeError"),
              icon: "none"
            });
            break;
          case "Sms code cannot be empty":
            uni.showToast({
              title: t("codeIsEmpty"),
              icon: "none"
            });
            break;
          case "Please send SMS to get mobile phone verification code.":
            uni.showToast({
              title: t("getCodeFirst"),
              icon: "none"
            });
            break;
          default:
            uni.showToast({
              title: res.data.errorInfo,
              icon: "none"
            });
            break;
        }
      }
    }
  } catch (error) {
    uni.showToast({
      title: t("loginFailed"),
      icon: "none"
    });
  }
};

// 登录入口
const loginIM = () => {
  if (!privacyChecked.value) {
    uni.showToast({ title: t("privacyChecked"), icon: "none" });
    return;
  }
  if (isPasswordLogin.value) {
    loginWithPassword();
  } else {
    loginWithTel();
  }
};

const toPrivacy = () => {
  const url = "https://www.easemob.com/terms";
  // #ifdef APP-PLUS
  plus.runtime.openURL(url);
  // #endif
  // #ifdef WEB
  window.open(url);
  // #endif
};

const checkboxChange = (e: any) => {
  privacyChecked.value = !!e.detail.value[0];
};
const toServerConfig = () => {
  uni.navigateTo({ url: "../ServerConfig/index" });
};
const captchaVerifyCallback = async (captchaVerifyParam: string) => {
  const data = { captchaResult: false, bizResult: true };
  if (!captchaVerifyParam) {
    uni.showToast({
      title: t("completeTheVerification"),
      icon: "none"
    });
    // toast.error(i18next.t("Please complete the verification"));
    // handleSendCode(false);
    return data;
  }
  captchaVerifyParam = await encryptAES(captchaVerifyParam, secret);
  const result = await getCode(captchaVerifyParam);
  data.captchaResult = result;

  return data;
};

// 验证通过后调用
const onBizResultCallback = () => {
  console.log("onBizResultCallback");
};

const getInstance = (instance) => {
  captcha = instance;
};
// 清除定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});

onMounted(() => {
  captchaButton = document.getElementById("captcha-button");
  // @ts-ignore
  window.initAliyunCaptcha({
    SceneId: sceneId, // 场景ID。根据步骤二新建验证场景后，您可以在验证码场景列表，获取该场景的场景ID
    prefix: prefix, // 身份标。开通阿里云验证码2.0后，您可以在控制台概览页面的实例基本信息卡片区域，获取身份标
    mode: "popup", // 验证码模式。popup表示要集成的验证码模式为弹出式。无需修改
    element: "#captcha-element", // 页面上预留的渲染验证码的元素，与原代码中预留的页面元素保持一致。
    button: "#captcha-button", // 触发验证码弹窗的元素。button表示单击登录按钮后，触发captchaVerifyCallback函数。您可以根据实际使用的元素修改element的值
    captchaVerifyCallback: captchaVerifyCallback, // 业务请求(带验证码校验)回调函数，无需修改
    onBizResultCallback: onBizResultCallback, // 业务请求结果回调函数，无需修改
    getInstance: getInstance, // 绑定验证码实例函数，无需修改
    slideStyle: {
      width: 360,
      height: 40
    }, // 滑块验证码样式，支持自定义宽度和高度，单位为px。其中，width最小值为320 px
    language: "cn" // 验证码语言类型，支持简体中文（cn）、繁体中文（tw）、英文（en）
  });
});

onBeforeUnmount(() => {
  captchaButton = null;
  // 必须删除相关元素，否则再次mount多次调用 initAliyunCaptcha 会导致多次回调 captchaVerifyCallback
  document.getElementById("aliyunCaptcha-mask")?.remove();
  document.getElementById("aliyunCaptcha-window-popup")?.remove();
});
</script>

<style lang="scss" scoped>
@import url("./style.scss");
</style>
