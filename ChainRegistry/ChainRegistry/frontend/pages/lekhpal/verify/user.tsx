import {
	Box,
	Button,
	Code,
	HStack,
	IconButton,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Tfoot,
	Th,
	Thead,
	Tr,
	useDisclosure,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NextPage } from "next";
import { FC, useEffect, useState } from "react";
import useWeb3Store from "../../../utils/web3store";

const VerifyUser: NextPage = () => {
	const { onOpen, isOpen, onClose } = useDisclosure();
	const [users, setUsers] = useState<Array<any>>([]);
	const [activeAddress, setActiveAddress] = useState<string>();
	const [emptyList, setEmptyList] = useState<boolean>(false);
	const contract = useWeb3Store((state) => state.contract);
	const toast = useToast();

	const query = useQuery(
		["getUnverifiedUsers"],
		async () => {
			const unverifiedUsers = await contract?.getUnverifiedUsers();
			return unverifiedUsers as Array<any>;
		},
		{
			onSuccess: (data) => {
				if (data[0] === "0x0000000000000000000000000000000000000000") {
					setEmptyList(true);
				}
				setUsers(
					data.filter((user) => {
						return user !== "0x0000000000000000000000000000000000000000";
					}),
				);
			},
			onError: (err) => {
				toast({
					title: "Error",
					description: "Couldn't fetch data",
					duration: 1000,
					status: "error",
					isClosable: true,
				});
			},
		},
	);

	if (query.isLoading) {
		return <Box p={8}>Loading Unverified Users...</Box>;
	}
	if (emptyList) return <Box p={8}>No Unverified Users :)</Box>;

	return (
		<Box p={8}>
			<TableContainer>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>#</Th>
							<Th>Address</Th>
							<Th>Verify</Th>
						</Tr>
					</Thead>
					<Tbody>
						{users.map((address, i) => (
							<Tr key={i}>
								<Td>{i + 1}</Td>
								<Td>{address}</Td>
								<Td>
									<HStack>
										<IconButton
											colorScheme="green"
											aria-label="Accept"
											onClick={() => {
												setActiveAddress(address);
												onOpen();
											}}
											icon={
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={1.5}
													stroke="currentColor"
													style={{
														width: 20,
														height: 20,
													}}
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M4.5 12.75l6 6 9-13.5"
													/>
												</svg>
											}
										/>
									</HStack>
								</Td>
							</Tr>
						))}
					</Tbody>
					<Tfoot>
						<Tr>
							<Th>#</Th>
							<Th>Address</Th>
							<Th>Verify</Th>
						</Tr>
					</Tfoot>
				</Table>
			</TableContainer>
			<VerifyUserModal address={activeAddress} isOpen={isOpen} onClose={onClose} />
		</Box>
	);
};

export const VerifyUserModal: FC<{
	isOpen: boolean;
	onClose: () => void;
	address: string | undefined;
}> = ({ isOpen, onClose, address }) => {
	const [user, setUser] = useState<any>(null);
	const [panUrl, setPanUrl] = useState<string | null>(null);
	const [aadharUrl, setAadharUrl] = useState<string | null>(null);
	const [panType, setPanType] = useState<"image" | "pdf" | null>(null);
	const [aadharType, setAadharType] = useState<"image" | "pdf" | null>(null);
	const toast = useToast();
	const contract = useWeb3Store((state) => state.contract);
	const queryClient = useQueryClient();

	useQuery(
		["user", address],
		async () => {
			const user = await contract?.UserMapping(address);
			return user;
		},
		{
			enabled: !!address,
			onSuccess: (data) => {
				setUser(data);
			},
		},
	);

	useEffect(() => {
		// Cleanup object URLs when modal closes or URLs change
		return () => {
			if (panUrl) URL.revokeObjectURL(panUrl);
			if (aadharUrl) URL.revokeObjectURL(aadharUrl);
		};
	}, [panUrl, aadharUrl]);

	const viewFile = (cid: string, setter: (url: string | null) => void, setType: (t: "image" | "pdf") => void) => {
		const base64 = localStorage.getItem(cid);
		if (!base64) {
			alert("File not found in localStorage.");
			return;
		}
		// Detect mime-type from base64 prefix (optional)
		let mimeType = "application/octet-stream"; // fallback mime
		if (base64.startsWith("JVBER")) {
			// PDF files base64 usually start with JVBER
			mimeType = "application/pdf";
			setType("pdf");
		} else {
			// Assume image otherwise
			mimeType = "image/*";
			setType("image");
		}

		// Convert base64 to blob and create object URL
		const byteCharacters = atob(base64);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const blob = new Blob([byteArray], { type: mimeType });
		const url = URL.createObjectURL(blob);
		setter(url);
	};

	return (
		<Modal isOpen={isOpen} onClose={() => { onClose(); setPanUrl(null); setAadharUrl(null); }}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Verify User</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Text fontWeight="bold" mb={2}>
						{address}
					</Text>
					{!user ? (
						<Spinner />
					) : (
						<VStack align="start" spacing={2}>
							<Text><b>Name:</b> {user?.name}</Text>
							<Text><b>Age:</b> {user?.age && JSON.parse(user.age)}</Text>
							<Text><b>Email:</b> {user?.email}</Text>
							<Text><b>City:</b> {user?.city}</Text>
							<HStack spacing={4}>
								<Button onClick={() => viewFile(user?.panNumber, setPanUrl, setPanType)}>View PAN</Button>
								<Button onClick={() => viewFile(user?.aadharNumber, setAadharUrl, setAadharType)}>View Aadhar</Button>
							</HStack>

							{panUrl && panType === "image" && (
								<Box maxW="400px" maxH="400px" overflow="auto" border="1px solid gray" p={2}>
									<img src={panUrl} alt="PAN Document" style={{ maxWidth: "100%", maxHeight: "100%" }} />
								</Box>
							)}
							{panUrl && panType === "pdf" && (
								<iframe src={panUrl} width="100%" height="400px" title="PAN Document" />
							)}

							{aadharUrl && aadharType === "image" && (
								<Box maxW="400px" maxH="400px" overflow="auto" border="1px solid gray" p={2}>
									<img src={aadharUrl} alt="Aadhar Document" style={{ maxWidth: "100%", maxHeight: "100%" }} />
								</Box>
							)}
							{aadharUrl && aadharType === "pdf" && (
								<iframe src={aadharUrl} width="100%" height="400px" title="Aadhar Document" />
							)}
						</VStack>
					)}
				</ModalBody>
				<ModalFooter>
					<Button
						colorScheme="green"
						onClick={() => {
							contract?.verifyUser(address).then((tx: any) => tx.wait()).then(() => {
								toast({
									title: "Success",
									description: `User verified.`,
									status: "success",
									isClosable: true,
									duration: 3000,
								});
								queryClient.refetchQueries(["getUnverifiedUsers"]);
								onClose();
							}).catch(() => {
								toast({
									title: "Error",
									description: "Verification failed.",
									status: "error",
									isClosable: true,
									duration: 3000,
								});
								onClose();
							});
						}}
						isLoading={false}
						rounded="full"
					>
						Confirm
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default VerifyUser;
