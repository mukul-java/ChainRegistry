import { Box, Heading, Text, useColorMode } from '@chakra-ui/react';
import { FC } from 'react';
import useUserStore from '../utils/store';
import ChainHeading from './Heading';

interface NavbarProps {
  currentRoute?: string;
}

const Navbar: FC<NavbarProps> = ({ currentRoute }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box h="full" w="full" display={'flex'} gap={16} alignItems="center" p={8}>
      <ChainHeading />
    </Box>
  );
};

export default Navbar;
