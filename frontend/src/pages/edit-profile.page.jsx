import { useEffect, useContext, useState, useRef } from "react";
import { UserContext } from "../App";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import {toast,Toaster} from "react-hot-toast";
import InputBox from "../components/input.component";
import { uploadImage } from "../common/aws";
import { storeInSession } from "../common/session";

const EditorProfile = () => {
  const { userAuth,setUserAuth } = useContext(UserContext) || {};
  const access_token = userAuth?.access_token;

  let biolimit=150;
  let profileImgEle=useRef();
  let editProfileForm=useRef();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [characterLeft,setCharacterLeft]=useState(biolimit);
 const [updatedProfileImg,setUpdatedProfileImg]=useState(null);

  useEffect(() => {
    if (access_token) {

      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          const user = data.users[0];
          setProfile(user); // Asynchronous update
          setLoading(false); // Set loading to false
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
          setLoading(false); 
        });
    }
  }, [access_token]);

  const handleCharactersChange=(e)=>{
    setCharacterLeft(biolimit-e.target.value.length)
  }

  const { personal_info, account_info, social_links, joinedAt } = profile || {};
  const { fullname, username: profileUsername, profile_img, bio,email } = personal_info || {};
  const { total_posts, total_reads } = account_info || {};
  
  if (loading) {
    return <div>Loading...</div>; 
  }

  const handleImagePreview=(e)=>{
    
    let img=e.target.files[0];
    if (img && img.type !== "image/jpeg") {
        toast.error("Only JPEG images are allowed.");
        setLoading(false); 
        return; 
      }
    profileImgEle.current.src=URL.createObjectURL(img);

    setUpdatedProfileImg(img);

    
  }

  const handleImageUpload = (e) => {
    e.preventDefault();
  
    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading....");
  
      e.target.setAttribute("disabled", true);
  
      uploadImage(updatedProfileImg)
        .then(url => {
          if (url) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img", { url }, {
              headers: {
                'Authorization': `Bearer ${access_token}`
              }
            })
              .then(({ data }) => {
                let newUserAuth = { ...userAuth, profile_img: data.profile_img };
                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
  
                setUpdatedProfileImg(null);
                toast.dismiss(loadingToast);
                toast.success("Upload Successful"); 
              })
              .catch((err) => {
                toast.dismiss(loadingToast); 
                e.target.removeAttribute("disabled"); 
                if (err.response && err.response.data) {
                  toast.error(err.response.data.error); 
                } else {
                  toast.error("An unknown error occurred.");
                }
              });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast); 
          console.error("Upload failed", err);
        });
    }
    
  };

  const handleSubmit=(e)=>{
    e.preventDefault();
    let form=new FormData(editProfileForm.current);
    let formData={ };
    
    for(let[key,value] of form.entries()){
        formData[key]=value;
    }
    let {username,bio,youtube,github,facebook,twitter,instagram,website}=formData;

    if(username.length < 3){
        toast.error("Username shouble be at least 3 letters long");
    }
    if(biolimit.length > biolimit){
        toast.error(`Bio should not be more than ${biolimit}`);
    }

    let loadingToast=toast.loading("Updating....");

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", 
        { username, bio, social_links: { youtube, github, facebook, twitter, instagram, website } }, 
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      ) // <-- Add this closing parenthesis
      .then(({ data }) => {
        if (userAuth.username !== data.username) {
          let newUserAuth = { ...userAuth, username: data.username };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
      
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.success("Profile updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
      
  }
  

  return (

    <AnimationWrapper>

        {
            loading ? <Loader/> : 
            <form ref={editProfileForm}>
                <Toaster/>

                <h1 className="max-md:hidden">Edit Profile</h1>

                <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">

                    <div className="max-lg:center mb-5">
                        <label htmlFor="uploadImg" id="profileImgLable" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                            <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">Upload Image</div> 
                            <img ref={profileImgEle} src={profile_img}/>
                        </label>
                        <input type="file" id="uploadImg" accept=".jpeg,.png,.jpg" hidden onChange={handleImagePreview}/>
                        
                        <button className="btn-light mt-5 max-lg:center lg:w-full px-10" type="button" onClick={handleImageUpload}>Upload</button>
                    </div>
                    <div className="w-full">
                        <div className="grid grid-cols--1 md:grid-cols-2 md:gap-5">

                            <div>
                                <InputBox name="fullname" type="text" value={fullname}
                                placeholder="Full name" disable={true} icon="fi-rr-user"/>
                            </div>
                            <div>
                                <InputBox name="email" type="email" value={email}
                                placeholder="Email" disable={true} icon="fi-rr-envelope"/>
                            </div>
                            

                        </div>

                        <InputBox type="text" name="username" value={profileUsername} placeholder="Username" icon="fi-rr-at"/>

                        <p className="text-dark-grey -mt-3">Username will use to search user and will be visible to all users</p>

                        <textarea name="bio" maxLength={biolimit} defaultValue={bio} className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" placeholder="Bio" onChange={handleCharactersChange}></textarea>

                        <p className="mt-1 text-dark-grey">{characterLeft} characters left</p>

                        <p className="my-6 text-dark-grey">Add your social handles below</p>

                        <div className="md:grid md:grid-cols-2 gap-x-6">
                        {
                            Object.keys(social_links).map((key, i) => {
                                let link = social_links[key];

                                
                                let icon = null;
                                switch (key) {
                                    case "facebook":
                                        icon = "fi-brands-facebook";
                                        break;
                                    case "github":
                                        icon = "fi-brands-github";
                                        break;
                                    case "instagram":
                                        icon = "fi-brands-instagram text-2xl";
                                        break;
                                    case "twitter":
                                        icon = "fi-brands-twitter text-2xl";
                                        break;
                                    case "youtube":
                                       icon ="fi-brands-youtube text-2xl";
                                        break;
                                    case "website":
                                        icon = "fi-rr-globe text-2xl";
                                        break;
                                    default:
                                        icon = null;
                                }

                                return <InputBox key={i} name={key} type="text" value={link} placeholder="https://" icon={icon}/>
                            })
                        }

                        </div>
                        <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>Update</button>
                    </div>
                </div>
            </form>
        }

    </AnimationWrapper>
  );
};

export default EditorProfile;
