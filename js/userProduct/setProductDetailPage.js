import { checkAuthorization } from "../api/checkAuthorization";
import { getDetailProduct } from "../api/getDetailProduct";
import { getLocalStorageData } from "../localStorage/getLocalStorageData";
import setSidebarSwiper from "../userSidebar/setSidebarSwiper";
import addCart from "../utils/addCart";
import toggleCountButton from "./toggleCountButton";

export async function setProductDetailPage(id, router) {
  const productInfo = await getDetailProduct(id);
  // 상품이 품절 상태일 때 품절 div 띄우기
  if (productInfo.isSoldOut) {
    const soldOutDiv = document.querySelector(".sold-out");
    soldOutDiv.style.display = "flex";
  }
  // 상품 정보 뿌리기
  const title = document.querySelector(".product-title");
  title.textContent = productInfo.title;

  const thumbnail = document.querySelector(".thumbnail img");
  thumbnail.src = productInfo.thumbnail;
  thumbnail.alt = productInfo.title;

  const price = document.querySelector(".product-price .price-num");
  price.textContent = productInfo.price.toLocaleString();

  const productDetail = document.querySelector(".detail-img img");
  productDetail.src = productInfo.photo;
  thumbnail.alt = "상품 상세정보";

  const discountRate = document.querySelector(".discount-rate");
  const originPrice = document.querySelector(".origin-price");
  if (productInfo.discountRate) {
    discountRate.querySelector("span").textContent = productInfo.discountRate;
    originPrice.querySelector("span").textContent = parseInt(
      (productInfo.price * 100) / (100 - productInfo.discountRate)
    ).toLocaleString();
  } else {
    discountRate.innerHTML = "";
    originPrice.innerHTML = "";
  }

  // btn-wrapper padding-top 조절
  const btnWrapper = document.querySelector(".btn-wrapper");
  if (productInfo.discountRate != 0) {
    btnWrapper.style.paddingTop = "145px";
  }
  const totalPrice = document.querySelector(".total-num");
  totalPrice.textContent = productInfo.price.toLocaleString();

  // 로그인한 상태이면 로그인해야 이용가능 텍스트 안보이게
  // 로그인한 상태이면 찜목록에 해당 제품 있는지 확인
  const wishButton = document.querySelector(".wish-btn");
  const isLogined = await checkAuthorization();
  const loginText = document.querySelector(".product-login-text");
  if (isLogined) {
    loginText.style.display = "none";
    let wishList = getLocalStorageData("wishList");
    if (!wishList) wishList = [];
    const isWished = wishList.find((item) => item.id === productInfo.id);
    if (isWished) {
      wishButton.classList.add("active");
    }
  } else {
    loginText.style.display = "block";
  }

  // 수량 조절 기능
  toggleCountButton(productInfo.price);

  // 찜하기 버튼 토글 기능
  wishButton.addEventListener("click", () => {
    // 로그인 상태가 아니면 로그인 페이지로 이동하도록
    if (!isLogined) {
      Swal.fire({
        title: "로그인하셔야 본 기능을 이용하실 수 있습니다.",
      }).then(() => {
        router.navigate("/login");
      });

      return;
    }
    const loginedId = getLocalStorageData("loginId");
    let loginedIdData = getLocalStorageData("loginIdData");
    let wishList = getLocalStorageData("wishList");
    const hasClass = wishButton.classList.contains("active");
    if (!wishList) {
      wishList = [];
    }
    if (hasClass) {
      wishButton.classList.remove("active");
      wishList = wishList.filter((item) => item.id != productInfo.id);
    } else {
      wishButton.classList.add("active");
      wishList.push({
        id: productInfo.id,
        title: productInfo.title,
        thumbnail: productInfo.thumbnail,
        discountRate: productInfo.discountRate,
        price: productInfo.price,
      });
    }
    loginedIdData.wishList = wishList;
    localStorage.setItem(loginedId, JSON.stringify(loginedIdData));
  });

  // 장바구니에 담기 기능
  const cartButton = document.querySelector(".cart-btn");
  cartButton.addEventListener("click", async () => {
    const quantity = document.querySelector(
      ".product-quantity .count"
    ).textContent;

    addCart(productInfo, quantity, router);
  });

  // 세팅되면 스피너 사라지도록
  const spinner = document.querySelector(".spinner-wrapper");
  spinner.style.display = "none";

  setSidebarSwiper(router);
}