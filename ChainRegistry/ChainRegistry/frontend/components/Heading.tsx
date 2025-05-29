import { Heading, Tooltip, useColorMode } from '@chakra-ui/react';
import { FC } from 'react';

const ChainHeading: FC<{
  sq?: number | string;
  textSize?: number | string;
}> = ({ sq = '40px', textSize = undefined }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Tooltip placement="auto" label="Click to see magic!!">
      <Heading
        display={'inline-flex'}
        alignItems="center"
        fontFamily={'body'}
        gap={'2'}
        userSelect="none"
        onClick={toggleColorMode}
        fontSize={textSize}
      >
        ChainRegistry
      </Heading>
    </Tooltip>
  );
};

export default ChainHeading;
