import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface PageBannerProps {
  title: string;
  breadcrumbs: Array<{
    label: string;
    path?: string;
  }>;
  backgroundImage: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ title, breadcrumbs, backgroundImage }) => {
  return (
    <Box sx={{
      position: 'relative',
      height: '300px',
      width: '100%',
      marginBottom: 4,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="h2" component="h1" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
        <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'white' }}>
          {breadcrumbs.map((crumb, index) => 
            crumb.path ? (
              <Link
                key={index}
                component={RouterLink}
                to={crumb.path}
                sx={{ 
                  color: 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={index} sx={{ color: 'white' }}>
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      </Box>
    </Box>
  );
};

export default PageBanner;
