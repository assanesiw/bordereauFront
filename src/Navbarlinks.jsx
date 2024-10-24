import { useState } from 'react';
import { Group, Box, Collapse, UnstyledButton, rem } from '@mantine/core';
import { IconCalendarStats, IconChevronRight } from '@tabler/icons-react';
// import classes from './Navbarnested.module.css';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export const LinksGroup = ({ label, initiallyOpened, links }) => {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const items = (hasLinks ? links : []).map((link) => (
    <Link
      className=""
      to={link.link}
      key={link.label}
    >
      {link.label}
    </Link>
  ));

  return (
    <>
      <UnstyledButton onClick={() => setOpened((o) => !o)} className="">
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className=""
              stroke={1.5}
              style={{
                width: rem(16),
                height: rem(16),
                transform: opened ? 'rotate(-90deg)' : 'none',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}

const mockdata = {
  label: 'Releases',
  icon: IconCalendarStats,
  links: [
    { label: 'Upcoming releases', link: '/' },
    { label: 'Previous releases', link: '/' },
    { label: 'Releases schedule', link: '/' },
  ],
};

export function NavbarLinksGroup() {
  return (
    <Box mih={220} p="md">
      <LinksGroup {...mockdata} />
    </Box>
  );
}