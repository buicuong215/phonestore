import Spinner from "../component/spinner/spinner.js";


window.customElements.define("my-spinner", Spinner);


const routes = {
  404: {
    template: "src/pages/404.html",
  },
  home: {
    template: "src/pages/home.html",
  },
  products: {
    template: "src/pages/products.html",
  },
  cart: {
    template: "src/pages/cart.html",
  },

  sign: {
    template: "src/pages/sign.html",
  },
  search: {
    template: "src/pages/search.html",
  },
};

const defaultProductRender = 10;
var location;
let state = {
  data: [],
  filterProduct: [],
  products: [],
  productsRender: [],
 
  searchReslts: [],
  checkOut: [],
  accounts: [],
  currentPage: 1,
};

const title = ["all", "samsung", "nokia", "realme", "oppo", "xiaomi", "apple"];

const getDataFromJson = () => {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      state.data = data;
    });
};

const getAllProduct = () => {
  state.products = state.data.reduce((acc, item) => {
    return [...acc, ...item.products];
  }, []);
};

const locationHandler = async () => {
  location = window.location.hash.replace("#", "");

  if (location.length === 0) {
    location = "home";
  }

  const route = routes[location] || routes["404"];
  const html = await fetch(route.template).then(response => response.text());
  document.querySelector(".main-page").innerHTML = html;
  document.title = location === "/" ? "Home Page" : location.replace(location[0], location[0].toUpperCase()) + " Page";

  if (state.products.length === 0) {
    getAllProduct();
  }
  if (location === "home") {
    setInterval(() => {
      let colorRandom = Math.floor(Math.random() * 16777215).toString(16);
      const contentText = document.querySelector(".content-text");
      if (contentText) {
        contentText.style.color = `#${colorRandom}`;
        
      };
    },1500)
  }


  if (location === "products") {
    //render logo
    state.currentPage = 1;
    const productsCategory = document.querySelector(".products-category");
    const html = title
      .map((item, index) => {
        if (index === 0) {
          return ` <button class="btn-title ${item} title-active" data-title=${item}>
            <img src="src/asset/${item}_logo.png" alt="logo">
        </button>`;
        }
        return ` <button class="btn-title ${item}" data-title=${item}>
            <img src="src/asset/${item}_logo.png" alt="logo">
        </button>`;
      })
      .join("");

    productsCategory.innerHTML = html;
    //btn title handler
    state.filterProduct = state.products;
    state.productsRender = state.products;
     
    renderSpinner();
   
   
    setTimeout(() => {
      render(state.currentPage);
       createPage();
},1000)


    const btnTitle = document.querySelectorAll(".btn-title");
    btnTitle.forEach(btn => {
      btn.addEventListener("click", handleClickTitle);
    });

    const btnFilter = document.querySelector(".btn-filter");
    btnFilter.addEventListener("click", handlerFilterPrice);


    const btnPin = document.querySelector(".btn-pin");
    btnPin.addEventListener("click", (e) => {
      sortIn();
     
      render(state.currentPage);
    })
     const btnPDes = document.querySelector(".btn-pdes");
     btnPDes.addEventListener("click", e => {
       sortDes();  
       render(state.currentPage);
     });
  }
  if (location === "cart") {
    
    const localCart = localStorage.getItem("cartData");
    if (localCart) {
      state.checkOut = JSON.parse(localStorage.getItem("cartData"));
      
    }
    renderCart();
   
    

    const productContainer = document.querySelectorAll(".product-cart");
    productContainer.forEach(item => {
      item.addEventListener("click", e => {
        const btn = e.target.closest("button").className;
        const id = item.dataset.id;

        if (btn == "btn-des") {
          state.checkOut = state.checkOut.map(item => {
            if (id == item.id) {
              return { ...item, quantity: item.quantity - 1 };
            } else {
              return item;
            }
          });
          state.checkOut = state.checkOut.filter(item => {
            return item.quantity != 0;
          });
        }

        if (btn == "btn-in") {
          state.checkOut = state.checkOut.map(item => {
            if (id == item.id) {
              return { ...item, quantity: item.quantity + 1 };
            } else {
              return item;
            }
          });
        }
        if (btn == "btn-remove") {
          state.checkOut = state.checkOut.filter(item => {
            return item.id != id;
          });
        }
         localStorage.clear();
         localStorage.setItem("cartData", JSON.stringify(state.checkOut));

        reRender("#cart");
      });
    });
  }

  if (location === "sign") {
    animationSign()
    const signInParentEl = document.querySelector(".sign-in");
    const signUpParentEl = document.querySelector(".sign-up");
    //Sign In
    const account = document.getElementById("account");
    const password = document.getElementById("password");
    const btnLogin = signInParentEl.querySelector("button");

    //LOGIN
    btnLogin.addEventListener("click", e => {
      e.preventDefault();
      if (localAccount) {
        state.accounts = JSON.parse(localStorage.getItem("accountData"));
      }
      let check = false;
      state.accounts.forEach(item => {
        if (item.account == account.value && item.password == password.value) {
          check = true;
          alert(`hello ${item.account}`);
          account.value = password.value = "";
        } else if (item.account == account.value && item.password != password.value) {
          check = true;
          alert("Sai mật khẩu!");
        }
      });
      if (check === false) {
        alert("Tài khoản không tồn tại!");
      }
    });

    //Sign Up
    const accountSingUp = signUpParentEl.querySelector(".account");
    const passwordSingUp = signUpParentEl.querySelector(".password");
    const confirmPasswordSingUp = signUpParentEl.querySelector(".confirm-password");
    const btnSignUp = signUpParentEl.querySelector("button");
    const localAccount = localStorage.getItem("accountData");

    btnSignUp.addEventListener("click", e => {
      e.preventDefault();

      if (localAccount) {
        state.accounts = JSON.parse(localStorage.getItem("accountData"));
        console.log(state.accounts);
      }

      const before = state.accounts.length;
      if (passwordSingUp.value !== confirmPasswordSingUp.value) {
        alert("password do not match");
      } else {
        if (state.accounts.length >= 1) {
          let check = false;
          state.accounts.forEach(item => {
            if (item.account == accountSingUp.value) {
              alert("tài khoản đã tồn tại");
              check = true;
              return;
            }
          });

          if (check === false) {
            const account = accountSingUp.value;
            const password = passwordSingUp.value;
            state.accounts = [...state.accounts, { account, password }];
            alert("Dăng kí thành công!");
            accountSingUp.value = passwordSingUp.value = confirmPasswordSingUp.value = "";
          }
        } else {
          const account = accountSingUp.value;
          const password = passwordSingUp.value;
          state.accounts = [...state.accounts, { account, password }];
          alert("Dăng kí thành công!");
          accountSingUp.value = passwordSingUp.value = confirmPasswordSingUp.value = "";
        }
      }

      const after = state.accounts.length;

      if (before < after) {
        localStorage.clear();
        localStorage.setItem("accountData", JSON.stringify(state.accounts));
      }
    });
  }


  
  if (location === "search") {
    const btnSearch = document.querySelector(".btn-search");
    handlerSearch();
    btnSearch.addEventListener("click", handlerSearch)
     const btnFilter = document.querySelector(".btn-filter");
     btnFilter.addEventListener("click", handlerFilterPrice);

     const btnPin = document.querySelector(".btn-pin");
     btnPin.addEventListener("click", e => {
       sortIn();

       render(state.currentPage);
     });
     const btnPDes = document.querySelector(".btn-pdes");
     btnPDes.addEventListener("click", e => {
       sortDes();

       render(state.currentPage);
     });
  }
  
};

window.addEventListener("hashchange", locationHandler);

getDataFromJson();
locationHandler();
//product page handle

const createPage = () => {
 
  const page = Math.ceil(state.productsRender.length / defaultProductRender);

  const pageContainer = document.querySelector(".page");
  pageContainer.classList.remove("hidden-page")
  let htmlPage = "";
  for (let i = 1; i <= page; ++i) {
    htmlPage += `<div class="page-number">${i}</div>`;
  }
 
  pageContainer.innerHTML = htmlPage;
  pageReset();
  document.querySelectorAll(".page-number").forEach(btn => {
    btn.addEventListener("click", handlerPageClick);
  });
};

const pageReset = () => {
  const pageAll = document.querySelectorAll(".page-number");
  pageAll.forEach(btn => {
    btn.classList.remove("page-active");
  });
  pageAll[state.currentPage - 1].classList.add("page-active");
};

const handlerPageClick = e => {
  state.currentPage = Number(e.target.textContent);
  renderSpinner();
  setTimeout(() => {
    render(state.currentPage);
  },500)
  pageReset();
};

const renderSpinner = () => {
  const productsContainer = document.querySelector(".products-container");
  productsContainer.innerHTML = "";
  productsContainer.insertAdjacentHTML("afterbegin", "<my-spinner></my-spinner>");
   productsContainer.classList.add("flex-center");
}

const render = page => {
  const start = (page - 1) * defaultProductRender;
  const end = page * defaultProductRender - 1;
  if (state.productsRender.length > 0) {
    let html = state.productsRender
      .map((item, index) => {
        if (index >= start && index <= end) {
          return `<div class="product-container product-hidden" data-id=${item.id}>
         <img src="${item.imageUrl}" alt="${item.name}">
            <p>${item.name}</p>
            <p>${item.price}</p>
            <button class="btn-add">Add</button>
         </div>`;
        } else {
          return "";
        }
      })
      .join("");
    
   
    const productsContainer = document.querySelector(".products-container");
    productsContainer.classList.remove("flex-center");
    productsContainer.innerHTML = html;
  } else {
    notProducts();
  }
 
 
  const btnAdd = document.querySelectorAll(".btn-add");
  btnAdd.forEach(btn => {
    btn.addEventListener("click", addItemToCart);
  });
   animation();
};

const handleClickTitle = e => {
  state.currentPage = 1;
  const title = e.target.closest("button").dataset.title;
  document.querySelector(".title-phone").innerHTML = title;
  const titleActive = document.querySelector(`.${title}`);
  const btnTitle = document.querySelectorAll(".btn-title");
  btnTitle.forEach(btn => {
    btn.classList.remove("title-active");
  });
  titleActive.classList.add("title-active");

  const filterProduct = state.data.filter(item => {
    return item.title === title;
  });
  state.productsRender = filterProduct.length > 0 ? filterProduct[0].products : state.products;
  state.filterProduct = state.productsRender;

  document.querySelectorAll(".page-number").forEach(btn => {
    btn.addEventListener("click", handlerPageClick);
  });

  renderSpinner();
  setTimeout(() => {
    createPage();
    render(state.currentPage);
    
  },500)
};

const handlerFilterPrice = e => {
  state.currentPage = 1;
  let value = document.querySelector(".input-filter").value;
  document.querySelector(".products-container").innerHTML = '';
  state.productsRender = state.filterProduct.filter(item => {
    return (
      Number(item.price.replaceAll(",", "")) <= Number(value) + 1000000 &&
      Number(item.price.replaceAll(",", "")) >= Number(value) - 1000000
    );
  });
 
  if (state.productsRender.length > 0) {
   
    document.querySelectorAll(".page-number").forEach(btn => {
      btn.addEventListener("click", handlerPageClick);
    });
    renderSpinner();
    setTimeout(() => {
       createPage();
       render(state.currentPage);
    },2000)
  } else {
     renderSpinner();
     setTimeout(() => {
       notProducts();
     }, 2000);
  }
  document.querySelector(".input-filter").value = "";
};

const notProducts = () => {
  document.querySelector(".products-container").innerHTML = `<h1 class="not-product">Không có sản phẩm nào.</h1>`;
  document.querySelector(".products-container").classList.add("flex-center");
  document.querySelector(".page").classList.add("hidden-page");
}

const notProductsCart = () => {
  document.querySelector(".cart-container").innerHTML = `<h1 class="not-product">Không có sản phẩm nào.</h1>`;
  document.querySelector(".cart-container").classList.add("flex-center");
};

//Add item
const addItemToCart = e => {
  const id = e.target.parentElement.dataset.id;
  const [itemAdd] = state.products.filter(item => {
    return item.id == id;
  });

  let exsist = false;
  state.checkOut.forEach(item => {
    if (item.id == id) {
      alert("Sản Phẩm Đã Có Trong Giỏ Hàng.");
      exsist = true;
    } 
  });

  if (exsist === false) {
    alert("Đã thêm sản phẩm vào giỏ hàng.");
    itemAdd.quantity = 1;
    state.checkOut = [...state.checkOut, itemAdd];
  }
   localStorage.clear();
   localStorage.setItem("cartData", JSON.stringify(state.checkOut));
};

// Cart
const renderCart = () => {
  if (state.checkOut.length > 0) {
    let html = state.checkOut
      .map(item => {
        return `<div class="product-cart product${item.id}" data-id=${item.id}>
         <img src="${item.imageUrl}" alt="${item.name}">
            <p>${item.name}</p>
            
            <button class="btn-des"><ion-icon name="chevron-back-outline"></ion-icon></button>
            <div class="quantity">${item.quantity}</div>
             <button class="btn-in"><ion-icon name="chevron-forward-outline"></ion-icon></button>
            <p>${item.price}</p>
            <button class="btn-remove"><ion-icon name="remove-circle-outline"></ion-icon></button>
         </div>`;
      })
      .join("");
      document.querySelector(".cart-container").classList.remove("flex-center");
      document.querySelector(".cart-container").innerHTML = html;
    
  } else {
    notProductsCart();
  }
 
  total();
};

const reRender = (string) => {
  window.location = "#home";
  window.location = string;
};

const total = () => {
  const total = state.checkOut.reduce((total, item) => {
    return (total += Number(item.price.replaceAll(",", "")) * item.quantity);
  }, 0);

  document.querySelector(".total").innerHTML = "Total:" + total + "đ";
};

const handlerSearch = () => {
  state.currentPage = 1;
  const inputSearch = document.querySelector(".search-input");
  document.querySelector(".text").innerHTML = `Kết quả tìm kiếm : <span>${inputSearch.value}</span>`;
  if (inputSearch.value.length > 0) {
    state.productsRender = state.products.filter(item => {
      return item.name.toLowerCase().includes(inputSearch.value.toLowerCase());
    });
    if (state.productsRender.length > 0) {
      state.filterProduct = state.productsRender;
      document.querySelector(".products-container").innerHTML = "";
      renderSpinner();
      setTimeout(() => {
        render(state.currentPage);  
        createPage();
        inputSearch.value = "";
      },2000)
    } else {
      notProducts();
    }
  } else {
    alert("Hãy nhập sản phẩm bạn cần tìm. ");
    reRender('#home');
  }
  
}


const animation = () => {
     const productContainer = document.querySelector(".products-container");

     const obsCallback = function (entries, observer) {
       entries.forEach(e => {
         if (e.isIntersecting === true) {
           document.querySelectorAll(".product-container").forEach((e, i) => {
             e.classList.remove("product-hidden");
             e.style.transition = `${(i + 1) * 0.2}s`;
           });
         }
       });
     };

     const obsOptions = {
       root: null,
       threshold: 0.1,
     };

     const observer = new IntersectionObserver(obsCallback, obsOptions);
     observer.observe(productContainer);


}

const sortIn = () => {
 
  let temp={};
  for (let i = 0; i < state.productsRender.length-1; i++){
    for (let j = i + 1; j < state.productsRender.length; j++){
      if (Number(state.productsRender[i].price.replaceAll(",", "")) > Number(state.productsRender[j].price.replaceAll(",", ""))) {       
        temp = state.productsRender[i];
        state.productsRender[i] = state.productsRender[j];
        state.productsRender[j] = temp;
       }
    }
  }
}

const sortDes = () => {
   let temp = {};
   for (let i = 0; i < state.productsRender.length - 1; i++) {
     for (let j = i + 1; j < state.productsRender.length; j++) {
       if (
         Number(state.productsRender[i].price.replaceAll(",", "")) <
         Number(state.productsRender[j].price.replaceAll(",", ""))
       ) {
         temp = state.productsRender[i];
         state.productsRender[i] = state.productsRender[j];
         state.productsRender[j] = temp;
       }
     }
   }
}

const animationSign = () => {
  const signContainer = document.querySelector(".sign-container");

  const obsCallback = function (entries, observer) {
    entries.forEach(e => {
      if (e.isIntersecting === true) {
        document.querySelector(".sign-in").classList.remove("sign-hidden");
       document.querySelector(".sign-up").classList.remove("sign2-hidden");
      }
    });
  };

  const obsOptions = {
    root: null,
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(obsCallback, obsOptions);
  observer.observe(signContainer);

}