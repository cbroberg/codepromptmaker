import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountTab } from '@/components/settings/account-tab';
import { TokensTab } from '@/components/settings/tokens-tab';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="tokens">API Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-4">
          <AccountTab />
        </TabsContent>
        <TabsContent value="tokens" className="mt-4">
          <TokensTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
