import { forwardRef, CSSProperties, useState } from 'react';
import { Alert, Center, createStyles, Overlay, Paper } from '@mantine/core';
import { EdgeImage } from '~/components/EdgeImage/EdgeImage';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UniqueIdentifier } from '@dnd-kit/core';
import { IconArrowsMaximize } from '@tabler/icons';

//TODO - handle what to display when there is an error
type Props = {
  image?: CustomFile;
  children?: React.ReactNode;
  isPrimary?: boolean;
  disabled?: boolean;
  id: UniqueIdentifier;
} & React.ComponentPropsWithoutRef<'div'>;

export const ImageUploadPreview = forwardRef<HTMLDivElement, Props>(
  ({ image, children, isPrimary, disabled, id, ...props }, ref) => { //eslint-disable-line
    const { classes, cx } = useStyles({ isPrimary });
    const [ready, setReady] = useState(false);

    const sortable = useSortable({ id });

    const { attributes, listeners, isDragging, setNodeRef, transform, transition } = sortable;

    const style: CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: isDragging ? 'grabbing' : !disabled ? 'pointer' : 'auto',
    };

    if (!image) return null;

    return (
      <Paper
        ref={setNodeRef}
        className={cx(classes.root, { [classes.error]: image.status === 'blocked' })}
        {...props}
        radius="sm"
        style={{ ...style, ...props.style }}
      >
        {!ready && image.previewUrl ? (
          <EdgeImage src={image.previewUrl} height={410} className={classes.image} />
        ) : image.url && image.url != image.previewUrl ? (
          <EdgeImage
            src={image.url}
            height={410}
            className={classes.image}
            onLoad={() => {
              image.onLoad?.();
              setReady(true);
            }}
          />
        ) : null}

        {image.status === 'blocked' && (
          <>
            <Overlay color="#000" zIndex={10} />
            <Alert
              variant="filled"
              color="red"
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                textAlign: 'center',
                zIndex: 11,
              }}
              radius={0}
            >
              TOS Violation
            </Alert>
          </>
        )}

        <Center className={classes.draggable} {...listeners} {...attributes}>
          <Paper className={classes.draggableIcon} p="xl" radius={100}>
            <IconArrowsMaximize
              size={48}
              stroke={1.5}
              style={{ transform: 'rotate(45deg)' }}
              color="white"
            />
          </Paper>
        </Center>
        {children}
      </Paper>
    );
  }
);
ImageUploadPreview.displayName = 'ImagePreview';

const useStyles = createStyles(
  (
    theme,
    {
      // index,
      faded,
      isPrimary,
    }: {
      // index: number;
      faded?: boolean;
      isPrimary?: boolean;
    }
  ) => {
    const errorColors = theme.fn.variant({ variant: 'filled', color: 'red' });
    return {
      root: {
        position: 'relative',
        opacity: faded ? '0.2' : '1',
        transformOrigin: '0 0',
        height: isPrimary ? 410 : 200,
        gridRowStart: isPrimary ? 'span 2' : undefined,
        gridColumnStart: isPrimary ? 'span 2' : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'grey',
        overflow: 'hidden',
      },
      error: {
        border: `1px solid ${errorColors.background}`,
      },
      draggableIcon: {
        background: theme.fn.rgba('dark', 0.5),
        height: '120px',
        width: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: '50% 50%',
      },
      draggable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0,

        // transition: '.3s ease-in-out opacity',

        ['&:hover']: {
          opacity: 1,
        },
      },
    };
  }
);
