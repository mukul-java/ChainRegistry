import { Box, Link } from '@chakra-ui/react';
import { FC } from 'react';

const Footer: FC = () => {
  return (
    <Box h="full" w="full" p={8}>
    {' '}
      <Link href="https://github.com/" isExternal></Link>
      <Link href="https://github.com/" isExternal></Link> 
    </Box>
  );
};

export default Footer;
