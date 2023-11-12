import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import { Session } from 'next-auth';
import { Button, CenterContainer, Input } from '@/components/ui';
import { RootLayout } from '@/components';
import { useForm } from 'react-hook-form';
import {
  MutateUserProfileViewModel,
  mutateUserProfileViewModelSchema,
} from '@/models';
import { ajvResolver } from '@hookform/resolvers/ajv';
import { customFormats } from '@/lib/utils';
import { useSetUserProfileMutation } from '@/rtk';
import { useSession } from 'next-auth/react';

function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  let { returnUrl } = router.query;
  if (Array.isArray(returnUrl)) {
    [returnUrl] = returnUrl;
  }
  const [setUserProfile, setUserProfileStatus] = useSetUserProfileMutation();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<MutateUserProfileViewModel>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: ajvResolver(mutateUserProfileViewModelSchema, {
      $data: true,
      formats: customFormats,
    }),
  });

  function onSubmit(values: MutateUserProfileViewModel) {
    setUserProfile(values).then((result) => {
      router.push((returnUrl as string) ?? '/');
    });
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  if (status === 'unauthenticated') {
    router.push(`/auth/signIn/returnUrl=${returnUrl}`);
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      <h1>Create User Profile</h1>
      <p>This information is necessary to complete the registration process.</p>
      <form>
        <Input register={register} label="Full Name" name="name" />
        <Button onClick={handleSubmit(onSubmit)} disabled={!isValid}>
          Save
        </Button>
      </form>
    </div>
  );
}

Page.getLayout = function getLayout(page: ReactElement, session: Session) {
  return (
    <RootLayout session={session}>
      <CenterContainer type="flex">{page}</CenterContainer>
    </RootLayout>
  );
};

export default Page;
