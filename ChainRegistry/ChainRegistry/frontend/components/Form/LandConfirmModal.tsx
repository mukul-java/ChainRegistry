import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Code,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, FC } from 'react';
import useWeb3Store from '../../utils/web3store';

export const LandConfirmModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  data: any;
}> = ({ isOpen, onClose, data }) => {
  const [hash, setHash] = useState<string>();
  const toast = useToast();
  const contract = useWeb3Store((state) => state.contract);

  // Mutation to add land
  const mutation = useMutation(async () => {
    if (!contract) {
      throw new Error('Contract is not initialized');
    }

    // Replace this array with actual expected data or remove if not needed
    const exampleArray = [
      '3.456456',
      '3453.45345',
      '345.4533',
      '3453.4353',
    ]; // confirm what your contract expects here

    // Use correct property keys from form data
    const landType = data?.landType || data?.['land type'] || '';

    const txn = await contract.addLand(
      exampleArray,
      Number(data.area),
      data.address,
      Number(data.price),
      Number(data.pid),
      data.survey,
      landType,
      // Optional gasLimit can be passed here if needed
      // { gasLimit: 6000000 }
    );

    console.log('Adding Land....');
    const receipt = await txn.wait();

    setHash(receipt.transactionHash);
  });

  const confirmHandler = () => {
    mutation.mutate();
  };

  useEffect(() => {
    if (mutation.isError) {
      toast({
        title: 'Error',
        description:
          mutation.error instanceof Error
            ? mutation.error.message
            : 'An error occurred while adding land',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      onClose();
    }
    if (mutation.isSuccess) {
      toast({
        title: 'Land Added',
        description: `Transaction hash: ${hash?.slice(0, 10)}...`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });
      onClose();
    }
  }, [mutation.isError, mutation.isSuccess, hash, mutation.error, onClose, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>Confirm Adding Land</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Add Land with the following details
          <Code p={4} rounded="xl" mt={2} variant="outline" colorScheme="yellow" whiteSpace="pre-wrap">
            {JSON.stringify(data, null, 2)}
          </Code>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" colorScheme="red" mr={3} onClick={onClose}>
            Go Back
          </Button>
          <Button
            colorScheme="green"
            onClick={confirmHandler}
            loadingText="Adding Land"
            isLoading={mutation.isLoading}
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
