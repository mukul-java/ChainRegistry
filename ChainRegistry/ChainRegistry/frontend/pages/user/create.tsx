import {
	Box,
	Button,
	Heading,
	VStack,
	useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";

import { FormField, UserConfirmModal } from "../../components/Form";

interface FormData {
	name: string;
	age: string;
	city: string;
	phoneNo: string;
	email: string;
	adharFile?: File;
	panFile?: File;
}

function buf2hex(buffer: ArrayBuffer) {
	const bytes = new Uint8Array(buffer);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (typeof result === "string") {
				// Remove data:<mime>;base64, prefix if present
				const base64Data = result.split(",")[1] || result;
				resolve(base64Data);
			} else {
				reject("Failed to read file as base64");
			}
		};
		reader.onerror = (err) => reject(err);
		reader.readAsDataURL(file);
	});
}

async function hashBuffer(buffer: ArrayBuffer): Promise<string> {
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	return buf2hex(hashBuffer);
}

const Auth: NextPage = () => {
	const [data, setData] = useState<any>();
	const [hashes, setHashes] = useState<{ adhar?: string; pan?: string }>({});
	const [processing, setProcessing] = useState(false);

	const {
		isOpen: confirmIsOpen,
		onOpen: confirmOnOpen,
		onClose: confirmOnClose,
	} = useDisclosure();

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<FormData>();

	const signMessage = async (message: string) => {
		if (!window.ethereum) throw new Error("Metamask not detected");
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const signature = await signer.signMessage(message);
		return signature;
	};

	const storeInLocalStorage = (key: string, base64: string) => {
		localStorage.setItem(key, base64);
	};

	const handleFileChange = async (
		e: ChangeEvent<HTMLInputElement>,
		fileType: "adhar" | "pan",
	) => {
		try {
			if (!e.target.files?.[0]) return;
			setProcessing(true);
			const file = e.target.files[0];

			const base64Data = await fileToBase64(file);

			// Create a simple key for storage, e.g. hash of base64 data
			const base64Buffer = new TextEncoder().encode(base64Data);
			const fakeCid = await hashBuffer(base64Buffer.buffer as ArrayBuffer);

			storeInLocalStorage(fakeCid, base64Data);

			setHashes((prev) => ({
				...prev,
				[fileType]: fakeCid,
			}));

			setValue(`${fileType}File` as any, file);
			setProcessing(false);
		} catch (error) {
			console.error("File processing error:", error);
			setProcessing(false);
		}
	};

	const onSubmit = async (formData: FormData) => {
		if (!hashes.adhar || !hashes.pan) {
			alert("Please upload and process both Aadhar and PAN files first.");
			return;
		}
		try {
			const signature = await signMessage(
				`I confirm my documents at ${new Date().toISOString()}`,
			);

			setData({
				...formData,
				fileHashes: hashes,
				signature,
			});
			confirmOnOpen();
		} catch (err) {
			alert("Signing failed: " + err);
		}
	};

	return (
		<Box p={4}>
			<VStack spacing={4} maxW="container.md">
				<FormField name="name" errorsObj={errors.name} register={register} />
				<FormField name="age" errorsObj={errors.age} register={register} />
				<FormField name="city" errorsObj={errors.city} register={register} />

				<Heading textAlign={"left"} w="full" fontSize={"lg"}>
					Aadhar
				</Heading>
				<input
					required
					type="file"
					accept=".pdf,.jpg,.png"
					onChange={(e) => handleFileChange(e, "adhar")}
					disabled={processing}
				/>
				{hashes.adhar && (
					<Box fontSize="sm" color="green.600">
						Base64 file stored with key (fake CID): {hashes.adhar}
					</Box>
				)}

				<Heading textAlign={"left"} w="full" fontSize={"lg"}>
					PAN
				</Heading>
				<input
					required
					type="file"
					accept=".pdf,.jpg,.png"
					onChange={(e) => handleFileChange(e, "pan")}
					disabled={processing}
				/>
				{hashes.pan && (
					<Box fontSize="sm" color="green.600">
						Base64 file stored with key (fake CID): {hashes.pan}
					</Box>
				)}

				<FormField
					name="phoneNo"
					errorsObj={errors.phoneNo}
					register={register}
				/>
				<FormField
					name="email"
					inputProps={{ type: "email" }}
					errorsObj={errors.email}
					register={register}
				/>

				<Button
					onClick={handleSubmit(onSubmit)}
					colorScheme={"yellow"}
					disabled={processing || !hashes.adhar || !hashes.pan}
					minW="48"
				>
					Add
				</Button>
			</VStack>

			<UserConfirmModal
				isOpen={confirmIsOpen}
				onClose={confirmOnClose}
				data={data}
			/>
		</Box>
	);
};

export default Auth;
