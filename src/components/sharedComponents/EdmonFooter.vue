<template>
  <div class="footer dashboard">
    <div class="container-fluid">
      <div class="copyright">
        <p>© Copyright {{ new Date().getFullYear() }} <a href="#">Edmon</a> I All Rights Reserved</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EdmonFooter',
};
</script>

<style lang="scss" scoped>
.footer {
  border-top: 1px solid #223461;
  background: #1b2a4e;
  margin: auto 0 0 0;
  flex: 0 0 45px;
  display: flex;
  align-items: center;
  &.dashboard {
    background: #131722;
    border-color: #363c4e;
    // position: fixed;
    // bottom: 0;
    // left: 0;
    // right: 0;
  }
  .copyright {
    text-align: center;
    p {
      margin: 0;
      font-size: 14px;
      color: #7f88a6;
      a {
        color: #5d78ff;
        font-weight: 500;
      }
      // @include respond('phone') {
      //   text-align: center;
      // }
    }
  }
  .footer-social {
    text-align: right;
    // @include respond('phone') {
    //   text-align: center;
    // }
    li {
      display: inline-block;
      a {
        color: #7f88a6;
        padding: 0px 10px;
      }
    }
  }
}
</style>
