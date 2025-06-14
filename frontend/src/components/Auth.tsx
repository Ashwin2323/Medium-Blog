import type { SignupInput } from "@ashwin_codes/medium-common";
import { useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
 const navigate = useNavigate();
  const [postInput, setPostInput] = useState<SignupInput>({
    email: "",
    name: "",
    password: "",
  });

  async function sendRequest() {
    try{
        const response=await axios.post(`${BACKEND_URL}/api/v1/user/${type==="signup"?"signup":"signin"}`,postInput);
        const jwt = response.data.jwt;
        localStorage.setItem("token",jwt);
        navigate("/blogs");
    }catch(e){

    }
  }

  return (
    <div className="h-screen flex justify-center flex-col">
      <div className="flex justify-center">
        <div>
          <div className="px-9">
            <div className="text-3xl font-extrabold">
                {/* {type==="signin"?"Sign in":"Create an account"} */}
                Create an account 
            </div>
            <div className="text-slate-500">
              {type==="signin"?"Don't have an account?":"Already have an account?"}
              <Link className="underline pl-2" to={type==="signin"?"/signup":"/signin"}>
                {type==="signin"?"Sign up":"Sign in"}
              </Link>
            </div>
          </div>
          <div>
            {type==="signup"?<LabeledInput
              label="Name"
              placeholder="John Doe"
              onChange={(e) => {
                setPostInput({
                  ...postInput,
                  name: e.target.value,
                });
              }}
            />:null}
            <LabeledInput
              label="Email"
              placeholder="johndoe@example.com"
              onChange={(e) => {
                setPostInput({
                  ...postInput,
                  email: e.target.value,
                });
              }}
            />
            <LabeledInput
              label="Password"
              type={"Password"}
              placeholder="John123"
              onChange={(e) => {
                setPostInput({
                  ...postInput,
                  password: e.target.value,
                });
              }}
            />
            <button onClick={sendRequest} type="button" className="mt-5 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">{type==="signup"?"Sign up":"Sign in"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LabeledInputType {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function LabeledInput({
  label,
  placeholder,
  onChange,
  type,
}: LabeledInputType) {
  return (
    <div>
      <label className="block mb-2 text-sm text-black font-semibold pt-4">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        id="first_name"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder={placeholder}
        required
      />
    </div>
  );
}
