document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        
        const encodedUser = btoa(user);
        const encodedPass = btoa(pass);
        
        if (encodedUser === "YWRtaW4=" && encodedPass === "MTIzNDU=") {
          window.location.href = "main.html"; 
        } else {
          document.getElementById('errorMsg').style.display = "block";
        }
      });